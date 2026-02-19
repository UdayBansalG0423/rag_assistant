from dotenv import load_dotenv
import os

# Ensure values in `.env` take precedence over any already-set environment
# variables (e.g., from a prior terminal session).
load_dotenv(override=True)


class Settings:
    def __init__(self):
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.MODEL_NAME = os.getenv("MODEL_NAME")


settings = Settings()