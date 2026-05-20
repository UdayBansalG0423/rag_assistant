import os
import logging

import numpy as np
import requests

from app.services.embeddings.model_loader import load_sentence_transformer


logger = logging.getLogger(__name__)


class EmbeddingProvider:
    def __init__(self):
        self.provider = os.getenv("EMBEDDING_PROVIDER", "local")
        self.model = None

        if self.provider == "huggingface":
            self.api_key = os.getenv("HF_API_KEY")
            if not self.api_key:
                raise RuntimeError("HF_API_KEY not set")

            self.model_url = (
                "https://router.huggingface.co/hf-inference/"
                "models/sentence-transformers/all-MiniLM-L6-v2"
            )

    def _get_local_model(self):
        if self.model is None:
            self.model = load_sentence_transformer()
        return self.model

    def _normalize_texts(self, texts):
        if isinstance(texts, (str, bytes)):
            normalized = [texts.decode() if isinstance(texts, bytes) else texts]
        else:
            normalized = list(texts)

        normalized = ["" if text is None else str(text) for text in normalized]
        normalized = [text for text in normalized if text.strip()]

        logger.debug(
            "Embedding %d texts; sample types=%s",
            len(normalized),
            [type(text).__name__ for text in normalized[:5]],
        )

        return normalized

    def embed(self, texts):
        texts = self._normalize_texts(texts)

        if self.provider == "huggingface":
            headers = {"Authorization": f"Bearer {self.api_key}"}
            embeddings = []

            for text in texts:
                response = requests.post(
                    self.model_url,
                    headers=headers,
                    json={"inputs": text}
                )

                if response.status_code != 200:
                    raise RuntimeError(f"HuggingFace API error: {response.text}")

                data = response.json()

                if isinstance(data, list):
                    vector = np.mean(data, axis=0).tolist()
                    embeddings.append(vector)
                else:
                    raise RuntimeError(f"Unexpected HF response: {data}")

            return embeddings

        if self.provider == "local":
            model = self._get_local_model()
            batch_size = int(os.getenv("EMBED_BATCH_SIZE", "32"))
            clean_chunks = [
                str(chunk).strip()
                for chunk in texts
                if chunk and str(chunk).strip()
            ]

            print(f"Total chunks: {len(clean_chunks)}")

            embeddings = model.encode(
                clean_chunks,
                batch_size=batch_size,
                show_progress_bar=True,
            )

            if hasattr(embeddings, "tolist"):
                embeddings = embeddings.tolist()
            else:
                embeddings = [emb.tolist() if hasattr(emb, "tolist") else list(emb) for emb in embeddings]

            print("Embeddings generated successfully")

            return embeddings

        raise RuntimeError(f"Unsupported embedding provider: {self.provider}")