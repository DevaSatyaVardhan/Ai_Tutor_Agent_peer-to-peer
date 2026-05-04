from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ai_agent.chat_service import process_chat
from ai_agent.config import UPLOADS_DIR
from ai_agent.extractors import extract_text_from_image, extract_text_from_pdf
from ai_agent.memory_store import memory_clear
from ai_agent.schemas import ChatRequest
from ai_agent.vector_store import clear_vectorstore_namespace, get_vectorstore, index_text

app = FastAPI(title="AI Tutor Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/chat")
async def chat(req: ChatRequest):
    answer = process_chat(
        user_id=req.user_id,
        subject=req.subject,
        question=req.question,
        site_context=req.site_context,
    )
    return {"answer": answer}


@app.post("/upload/pdf/{user_id}/{subject}")
async def upload_pdf(user_id: str, subject: str, file: UploadFile = File(...)):
    memory_clear(user_id)
    clear_vectorstore_namespace(user_id, subject)
    vectorstore = get_vectorstore(user_id, subject)

    path = Path(UPLOADS_DIR) / file.filename
    with open(path, "wb") as upload_file:
        upload_file.write(await file.read())

    text = extract_text_from_pdf(str(path))
    chunks = index_text(
        vectorstore,
        text,
        {
            "user": user_id,
            "subject": subject,
            "filename": file.filename,
            "kind": "pdf",
        },
    )

    if chunks == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF. Try a clearer PDF or image upload.",
        )

    return {
        "message": "PDF indexed",
        "chunks": chunks,
        "subject": subject,
        "filename": file.filename,
    }


@app.post("/upload/image/{user_id}/{subject}")
async def upload_image(user_id: str, subject: str, file: UploadFile = File(...)):
    memory_clear(user_id)
    clear_vectorstore_namespace(user_id, subject)
    vectorstore = get_vectorstore(user_id, subject)

    path = Path(UPLOADS_DIR) / file.filename
    with open(path, "wb") as upload_file:
        upload_file.write(await file.read())

    text = extract_text_from_image(str(path))
    chunks = index_text(
        vectorstore,
        text,
        {
            "user": user_id,
            "subject": subject,
            "filename": file.filename,
            "kind": "image",
        },
    )

    if chunks == 0:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in image. Try a clearer image.",
        )

    return {
        "message": "Image indexed",
        "chunks": chunks,
        "subject": subject,
        "filename": file.filename,
    }
