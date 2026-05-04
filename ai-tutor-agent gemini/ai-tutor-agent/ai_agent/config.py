import os
from pathlib import Path

from dotenv import dotenv_values, load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    from langchain_community.embeddings import HuggingFaceEmbeddings


def _mask_key(value: str) -> str:
    if not value:
        return "NOT_SET"
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
VECTOR_DB_ROOT = BASE_DIR / "vector_db"
MEMORY_DIR = BASE_DIR / "memory"
MEMORY_DB_PATH = MEMORY_DIR / "chat_memory.sqlite3"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_DB_ROOT.mkdir(parents=True, exist_ok=True)
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(override=True)
DOTENV_PATH = BASE_DIR / ".env"
DOTENV_VALUES = dotenv_values(DOTENV_PATH)

PRIMARY_MODEL = os.getenv("GEMINI_MODEL_PRIMARY", "models/gemini-2.5-flash").strip()
FALLBACK_MODEL = os.getenv("GEMINI_MODEL_FALLBACK", "models/gemini-2.0-flash-lite").strip()
GOOGLE_API_KEY = (DOTENV_VALUES.get("GOOGLE_API_KEY") or "").strip()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()

print(
    f"[AI Startup] primary={PRIMARY_MODEL}, fallback={FALLBACK_MODEL}, key={_mask_key(GOOGLE_API_KEY)} (source=.env)"
)

if not GOOGLE_API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY in .env")

llm = ChatGoogleGenerativeAI(
    model=PRIMARY_MODEL,
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3,
)

fallback_llm = ChatGoogleGenerativeAI(
    model=FALLBACK_MODEL,
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3,
)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)
