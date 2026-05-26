from dotenv import load_dotenv

from app.core.logger import logger
from app.services.documents.chunker import DocumentChunker
from app.services.documents.parser import extract_pdf_pages, extract_pdf_text
from app.services.documents.sanitizer import clean_chunks
from app.services.embeddings.provider import EmbeddingProvider
from app.services.retrieval.retriever import VectorStore
import mlflow
import os
import time

from app.services.llm import generate_response

load_dotenv()

SIMILARITY_THRESHOLD = 5.0
CHECKPOINT_INTERVAL = 100


class RAGService:
    def __init__(self):
        self.embedding_provider = EmbeddingProvider()
        self.chunker = DocumentChunker()
        self.vector_provider = os.getenv("VECTOR_DB_PROVIDER", "faiss")

        if self.vector_provider == "pinecone":
            try:
                from app.services.retrieval.pinecone_store import PineconeVectorStore

                self.vector_store = PineconeVectorStore(384)
                logger.info("Vector store configured | provider=pinecone")
            except Exception as exc:
                logger.warning(f"Falling back to FAISS vector store: {exc}")
                self.vector_provider = "faiss"
                self.vector_store = VectorStore(384)
        else:
            self.vector_store = VectorStore(384)

        if self.vector_provider != "pinecone":
            if os.path.exists("vector_store/index.faiss"):
                self.vector_store.load()
                logger.info("Vector store loaded | provider=faiss")
            else:
                logger.info("No existing vector store found | provider=faiss")

    def index_pdf(self, path: str, user_id: str = None, document_id: str = None, stage_callback=None):
        pipeline_start = time.time()
        doc_id = document_id or os.path.basename(path)
        source_name = os.path.basename(path)
        logger.info("Indexing pipeline started | document_id=%s user_id=%s source=%s", doc_id, user_id, source_name)

        # progress/checkpoint files
        base_progress_dir = os.getenv("RAG_PROGRESS_DIR", "vector_store_progress")
        user_dir = user_id or "public"
        os.makedirs(os.path.join(base_progress_dir, user_dir), exist_ok=True)
        progress_path = os.path.join(base_progress_dir, user_dir, f"{doc_id}.json")

        def write_progress(state: dict):
            try:
                import json

                with open(progress_path, "w", encoding="utf-8") as pf:
                    json.dump(state, pf)
            except Exception as pf_exc:
                logger.warning("Failed to write progress file: %s", pf_exc)

        write_progress({
            "last_processed_chunk": 0,
            "last_index": 0,
            "total": 0,
            "progress": 0.0,
            "status": "extracting_pages",
        })

        extraction_start = time.time()
        logger.info("PDF extraction started | document_id=%s", doc_id)
        pages = extract_pdf_pages(path)
        logger.info(
            "PDF extraction completed | document_id=%s pages=%s duration_s=%.2f",
            doc_id,
            len(pages),
            time.time() - extraction_start,
        )
        if callable(stage_callback):
            stage_callback("extraction_complete")
        write_progress({
            "last_processed_chunk": 0,
            "last_index": 0,
            "total": 0,
            "progress": 0.0,
            "status": "chunking",
        })

        chunking_start = time.time()
        logger.info("Chunking started | document_id=%s", doc_id)
        chunk_records = self.chunker.chunk_pages(
            pages,
            user_id=user_id,
            document_id=document_id,
            source=source_name,
        )
        logger.info(
            "Chunking completed | document_id=%s chunks=%s duration_s=%.2f",
            doc_id,
            len(chunk_records),
            time.time() - chunking_start,
        )
        if callable(stage_callback):
            stage_callback("chunking_complete")

        clean_chunks_records = []
        for record in chunk_records:
            cleaned = clean_chunks([record.chunk])
            if not cleaned:
                continue
            clean_chunks_records.append({
                "chunk": cleaned[0],
                "metadata": record.metadata,
            })

        clean = clean_chunks_records

        if not clean:
            logger.warning(f"No clean chunks extracted from {path}")
            write_progress({
                "last_processed_chunk": 0,
                "last_index": 0,
                "total": 0,
                "progress": 0.0,
                "status": "failed",
                "error": "No clean chunks extracted",
            })
            return

        total = len(clean)
        start_index = 0
        # resume if checkpoint exists
        if os.path.exists(progress_path):
            try:
                import json

                with open(progress_path, "r", encoding="utf-8") as pf:
                    state = json.load(pf)
                    last_processed_chunk = int(state.get("last_processed_chunk", state.get("last_index", 0) - 1))
                    start_index = min(total, last_processed_chunk + 1)
            except Exception:
                start_index = 0

        batch_size = int(os.getenv("EMBED_BATCH_SIZE", "32"))
        last_processed_chunk = start_index - 1

        try:
            if callable(stage_callback):
                stage_callback("embedding_started")
            logger.info("Embedding generation started | document_id=%s total_chunks=%s", doc_id, total)
            embedding_stage_start = time.time()
            upsert_total_seconds = 0.0

            write_progress({
                "last_processed_chunk": max(-1, last_processed_chunk),
                "last_index": max(0, start_index),
                "total": total,
                "progress": round((start_index / total) * 100, 2) if total else 0.0,
                "status": "embedding",
            })

            for i in range(start_index, total, batch_size):
                batch_texts = clean[i : i + batch_size]

                if not batch_texts:
                    continue

                # embed batch (provider handles batching/fallbacks)
                embedding_batch_start = time.time()
                embeddings = self.embedding_provider.embed([item["chunk"] for item in batch_texts])
                embedding_batch_seconds = time.time() - embedding_batch_start

                # protect against mismatched lengths
                if len(embeddings) != len(batch_texts):
                    logger.warning(
                        "Embedding count mismatch: expected=%d got=%d; truncating",
                        len(batch_texts),
                        len(embeddings),
                    )
                    min_len = min(len(embeddings), len(batch_texts))
                    embeddings = embeddings[:min_len]
                    batch_texts = batch_texts[:min_len]

                # add to vector store
                batch_payload = batch_texts
                if self.vector_provider == "pinecone":
                    upsert_start = time.time()
                    self.vector_store.add_embeddings(embeddings, batch_payload, doc_id, user_id=user_id)
                    upsert_batch_seconds = time.time() - upsert_start
                    upsert_total_seconds += upsert_batch_seconds
                else:
                    upsert_start = time.time()
                    self.vector_store.add_embeddings(embeddings, batch_payload, user_id=user_id)
                    upsert_batch_seconds = time.time() - upsert_start
                    upsert_total_seconds += upsert_batch_seconds

                logger.info(
                    "Batch indexed | document_id=%s processed=%s/%s embed_s=%.2f upsert_s=%.2f",
                    doc_id,
                    i + len(batch_texts),
                    total,
                    embedding_batch_seconds,
                    upsert_batch_seconds,
                )

                last_processed_chunk = i + len(batch_texts) - 1
                processed_count = last_processed_chunk + 1
                percent = round((processed_count / total) * 100, 2)
                status = "embedding" if processed_count < total else "indexing"

                if processed_count % CHECKPOINT_INTERVAL == 0 or processed_count >= total:
                    write_progress({
                        "last_processed_chunk": last_processed_chunk,
                        "last_index": processed_count,
                        "total": total,
                        "progress": percent,
                        "status": status,
                    })

            # final save for non-pinecone stores
            if self.vector_provider != "pinecone":
                self.vector_store.save(f"vector_store/{user_id}" if user_id else "vector_store")
            logger.info(
                "Embedding generation completed | document_id=%s duration_s=%.2f upsert_total_s=%.2f",
                doc_id,
                time.time() - embedding_stage_start,
                upsert_total_seconds,
            )

            if callable(stage_callback):
                stage_callback("upsert_complete")
            logger.info("Vector upsert completed | document_id=%s provider=%s", doc_id, self.vector_provider)

            # mark done
            write_progress({
                "last_processed_chunk": total - 1,
                "last_index": total,
                "total": total,
                "progress": 100.0,
                "status": "done",
            })
            logger.info(
                "Indexing pipeline completed | document_id=%s user_id=%s total_duration_s=%.2f",
                doc_id,
                user_id,
                time.time() - pipeline_start,
            )

        except Exception as exc:
            logger.exception("Indexing failed for %s: %s", doc_id, exc)
            failed_count = last_processed_chunk + 1 if "last_processed_chunk" in locals() else start_index
            write_progress({
                "last_processed_chunk": max(0, failed_count - 1),
                "last_index": max(0, failed_count),
                "total": total,
                "progress": round((failed_count / total) * 100, 2) if total else 0.0,
                "status": "failed",
                "error": str(exc),
            })
            raise

    def retrieve(self, query: str, user_id: str = None):
        query_embedding = self.embedding_provider.embed([query])[0]
        logger.info("retrieval_start", extra={"user_id": user_id, "query": query})
        start = time.time()

        if self.vector_provider == "pinecone":
            results = self.vector_store.search(query_embedding, user_id=user_id)
        else:
            results = self.vector_store.search(query_embedding, user_id=user_id)

        latency_ms = int((time.time() - start) * 1000)
        logger.info("retrieval_success", extra={"user_id": user_id, "count": len(results), "latency_ms": latency_ms})
        return results

    def generate(self, query: str, user_id: str = None):
        mlflow.set_experiment("RAG-Observability")

        start_time = time.time()
        retrieved_results = self.retrieve(query, user_id=user_id)

        filtered = [r for r in retrieved_results if r["score"] <= SIMILARITY_THRESHOLD]
        sources = list(set([r["doc_id"] for r in filtered]))

        if not filtered:
            latency = round(time.time() - start_time, 2)
            logger.info(f"Query: {query}")
            logger.info("Retrieved count: 0")
            logger.info(f"Latency: {latency:.2f}s")
            return {
                "answer": "No relevant information found.",
                "sources": [],
                "latency": latency,
            }

        context = "\n\n".join([r["chunk"] for r in filtered])

        prompt = f"""
You are an AI assistant.
Answer ONLY from the provided context.
If answer is not in context, say "Information not found in context."

Context:
{context}

Question:
{query}

Answer:
"""

        answer = generate_response(prompt)

        generation_latency_ms = int((time.time() - start_time) * 1000)
        logger.info("generation_complete", extra={"query": query, "retrieved_count": len(filtered), "generation_latency_ms": generation_latency_ms})

        return {
            "answer": answer,
            "sources": sources,
            "latency": latency
        }

    def has_documents(self):
        return len(self.get_documents()) > 0

    def get_documents(self):
        if self.vector_provider == "pinecone":
            return self.vector_store.get_documents()

        docs = set()
        base = "vector_store"
        if os.path.exists(base):
            for root, _, files in os.walk(base):
                if "chunks.pkl" in files:
                    try:
                        import pickle

                        with open(os.path.join(root, "chunks.pkl"), "rb") as f:
                            pickle.load(f)
                        docs.add(os.path.basename(root))
                    except Exception:
                        pass

        return list(docs)