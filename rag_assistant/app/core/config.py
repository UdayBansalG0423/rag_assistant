from dotenv import load_dotenv
import os

# Ensure values in `.env` take precedence over any already-set environment
# variables (e.g., from a prior terminal session).
load_dotenv(override=True)


class Settings:
    def __init__(self):
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.MODEL_NAME = os.getenv("MODEL_NAME")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
        self.VECTOR_DB_PROVIDER = os.getenv("VECTOR_DB_PROVIDER", "faiss")
        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        self.PINECONE_INDEX = os.getenv("PINECONE_INDEX")
        self.EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local")


settings = Settings()