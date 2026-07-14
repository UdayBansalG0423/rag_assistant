from pathlib import Path
from dotenv import load_dotenv
import os

PROJECT_ROOT = Path(__file__).resolve().parents[3]
VALID_ENVIRONMENTS = {"development", "staging", "production"}
LOCAL_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]


def _load_environment_files() -> str:
    environment = os.getenv("ENVIRONMENT", "development").strip().lower() or "development"
    if environment not in VALID_ENVIRONMENTS:
        environment = "development"

    os.environ["ENVIRONMENT"] = environment

    # Prefer the project root .env when it exists
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=True)

    return environment


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self):
        self.ENVIRONMENT = _load_environment_files()
        self.IS_DEVELOPMENT = self.ENVIRONMENT == "development"
        self.IS_STAGING = self.ENVIRONMENT == "staging"
        self.IS_PRODUCTION = self.ENVIRONMENT == "production"
        self.DEBUG = self.IS_DEVELOPMENT

        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG" if self.DEBUG else "INFO").upper()
        self.MONITORING_VERBOSITY = os.getenv(
            "MONITORING_VERBOSITY",
            "minimal" if self.DEBUG else "standard",
        )
        self.API_RETRY_ATTEMPTS = int(os.getenv("API_RETRY_ATTEMPTS", "2" if self.DEBUG else "3"))

        cors_origin_default = ",".join(LOCAL_CORS_ORIGINS)
        self.CORS_ORIGINS = _parse_csv(os.getenv("CORS_ORIGINS", cors_origin_default))
        self.CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() in {
            "1",
            "true",
            "yes",
            "on",
        }

        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.JWT_SECRET = os.getenv("JWT_SECRET") or ("dev-only-change-me" if self.DEBUG else None)

        self.SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
        self.SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        self.SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or self.SUPABASE_KEY
        self.SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or (
            self.SUPABASE_KEY if self.DEBUG else None
        )

        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.3-70b-versatile")

        self.LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama" if self.DEBUG else "groq").lower()
        self.VECTOR_DB_PROVIDER = os.getenv("VECTOR_DB_PROVIDER", "faiss" if self.DEBUG else "pinecone").lower()
        self.EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local").lower()

        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        self.PINECONE_INDEX = os.getenv("PINECONE_INDEX")
        self.UPLOAD_DIR = os.getenv("UPLOAD_DIR", "data")

        self._validate()

    def _validate(self):
        errors = []

        if self.ENVIRONMENT not in VALID_ENVIRONMENTS:
            errors.append("ENVIRONMENT must be development, staging, or production")
        if not self.SUPABASE_URL:
            errors.append("SUPABASE_URL is not set")
        if not self.SUPABASE_ANON_KEY:
            errors.append("SUPABASE_KEY or SUPABASE_ANON_KEY is not set")
        if not self.SUPABASE_SERVICE_KEY:
            errors.append("SUPABASE_SERVICE_KEY is not set")
        if self.ENVIRONMENT != "development" and not self.JWT_SECRET:
            errors.append("JWT_SECRET is required outside development")
        if self.LLM_PROVIDER not in {"ollama", "groq", "gemini"}:
            errors.append("LLM_PROVIDER must be ollama, groq, or gemini")
        if self.VECTOR_DB_PROVIDER not in {"faiss", "pinecone"}:
            errors.append("VECTOR_DB_PROVIDER must be faiss or pinecone")
        if self.EMBEDDING_PROVIDER not in {"local", "gemini"}:
            errors.append("EMBEDDING_PROVIDER must be local or gemini")
        if self.LLM_PROVIDER == "groq" and not self.GROQ_API_KEY:
            errors.append("GROQ_API_KEY is not set")
        if self.LLM_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is not set")
        if self.VECTOR_DB_PROVIDER == "pinecone" and not self.PINECONE_API_KEY:
            errors.append("PINECONE_API_KEY is not set")
        if self.VECTOR_DB_PROVIDER == "pinecone" and not self.PINECONE_INDEX:
            errors.append("PINECONE_INDEX is not set")

        if errors:
            raise EnvironmentError("Missing required environment variables:\n" + "\n".join(f"  - {e}" for e in errors))


settings = Settings()