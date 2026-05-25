"""Pre-download and cache the sentence-transformer model locally.

Run this once before starting the API in environments that should not fetch
Hugging Face assets during request handling.
"""

import os
import sys


sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.model_registry import initialize_models


if __name__ == "__main__":
    model = initialize_models(force=True)
    print(f"Embedding model ready: {model.__class__.__name__}")