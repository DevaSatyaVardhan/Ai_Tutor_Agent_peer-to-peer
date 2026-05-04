import re
import shutil
from pathlib import Path

from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ai_agent.config import VECTOR_DB_ROOT, embeddings


def _safe_segment(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", (value or "").strip())
    return cleaned or "default"


def get_namespace_path(user_id: str, subject: str | None = None) -> Path:
    user_segment = _safe_segment(user_id)
    subject_segment = _safe_segment(subject or "default")
    return VECTOR_DB_ROOT / user_segment / subject_segment


def get_vectorstore(user_id: str, subject: str | None = None) -> Chroma:
    path = get_namespace_path(user_id, subject)
    path.mkdir(parents=True, exist_ok=True)
    return Chroma(
        persist_directory=str(path),
        embedding_function=embeddings,
    )


def clear_vectorstore_namespace(user_id: str, subject: str | None = None) -> None:
    path = get_namespace_path(user_id, subject)
    if path.exists():
        shutil.rmtree(path, ignore_errors=True)
    path.mkdir(parents=True, exist_ok=True)


def index_text(vectorstore: Chroma, text: str, metadata: dict) -> int:
    cleaned_text = (text or "").strip()
    if not cleaned_text:
        return 0

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    docs = splitter.create_documents([cleaned_text], metadatas=[metadata])
    if not docs:
        return 0

    vectorstore.add_documents(docs)
    return len(docs)
