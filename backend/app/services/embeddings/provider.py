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
            embeddings = []
            batch_size = int(os.getenv("EMBED_BATCH_SIZE", "32"))

            # Process in batches for performance; fall back to item-level on batch failure
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                try:
                    batch_emb = model.encode(batch)
                    # normalize returned structure
                    for emb in batch_emb:
                        if hasattr(emb, "tolist"):
                            embeddings.append(emb.tolist())
                        else:
                            embeddings.append(list(emb))
                except Exception as batch_exc:
                    logger.warning("Batch encode failed at batch starting %d: %s", i, batch_exc)
                    # per-item fallback for this batch
                    for j, text in enumerate(batch):
                        try:
                            single_emb = model.encode([text])
                            e = single_emb[0]
                            embeddings.append(e.tolist() if hasattr(e, "tolist") else list(e))
                        except Exception as item_exc:
                            logger.warning(
                                "Skipping embedding for chunk %d due to invalid input: %s",
                                i + j,
                                item_exc,
                            )

            return embeddings

        raise RuntimeError(f"Unsupported embedding provider: {self.provider}")