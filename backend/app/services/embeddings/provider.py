import os

import numpy as np
import requests

from app.services.embeddings.model_loader import load_sentence_transformer


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

    def embed(self, texts):
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
            return self._get_local_model().encode(texts).tolist()

        raise RuntimeError(f"Unsupported embedding provider: {self.provider}")