import os
import uuid
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -------- AI / LangChain --------
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate

# -------- PDF / Image --------
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


# =====================================
# FASTAPI APP
# =====================================
app = FastAPI(title="AI Tutor Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# AI SETUP
# =====================================
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",
    temperature=0.3
)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ⭐ dynamic DB path (prevents Windows lock issue)
VECTOR_DB_PATH = f"vector_db_{uuid.uuid4().hex}"

vectorstore = Chroma(
    persist_directory=VECTOR_DB_PATH,
    embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})


# =====================================
# PROMPT (REAL RAG + FALLBACK)
# =====================================
prompt = ChatPromptTemplate.from_template("""
You are an AI tutor.

RULES:
- If context is available → answer ONLY from context.
- If context is empty → answer normally using your knowledge.
- Never say "I cannot access the document".
- Give clear, student-friendly explanations.

Context:
{context}

Question:
{question}
""")


# =====================================
# REQUEST MODEL
# =====================================
class ChatRequest(BaseModel):
    user_id: str
    question: str


# =====================================
# RESET VECTOR DB (SAFE VERSION)
# =====================================
def reset_vector_db():
    """Create a fresh vector DB safely (no Windows lock)."""
    global vectorstore, retriever, VECTOR_DB_PATH

    VECTOR_DB_PATH = f"vector_db_{uuid.uuid4().hex}"

    vectorstore = Chroma(
        persist_directory=VECTOR_DB_PATH,
        embedding_function=embeddings
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})


# =====================================
# TEXT EXTRACTION
# =====================================
def extract_text_from_pdf(path: str) -> str:
    text = ""
    pdf = fitz.open(path)

    for page in pdf:
        page_text = page.get_text().strip()
        if page_text:
            text += page_text + "\n"

    return text.strip()


def extract_text_from_image(path: str) -> str:
    try:
        image = Image.open(path)

        # convert to grayscale (improves OCR)
        image = image.convert("L")

        # optional resize for better accuracy
        image = image.resize(
            (image.width * 2, image.height * 2)
        )

        text = pytesseract.image_to_string(image)

        return text.strip()

    except Exception as e:
        print("OCR ERROR:", e)
        return ""



# =====================================
# INDEXING
# =====================================
def index_text(text: str, metadata: dict):
    if not text:
        return 0

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120
    )

    docs = splitter.create_documents([text], metadatas=[metadata])
    vectorstore.add_documents(docs)
    vectorstore.persist()

    return len(docs)


# =====================================
# CHAT ENDPOINT
# =====================================
@app.post("/chat")
async def chat(request: ChatRequest):

    # Step 1 — retrieve docs
    docs = retriever.invoke(request.question)

    print("Retrieved docs:", len(docs))

    # Step 2 — build context
    context = "\n\n".join(doc.page_content for doc in docs) if docs else ""

    # Step 3 — improved prompt (VERY IMPORTANT)
    final_prompt = f"""
You are a friendly AI tutor and assistant.

Rules:
1. If the uploaded document context contains the answer → use it.
2. If the context does NOT contain the answer → answer from your general knowledge.
3. Never say you cannot access files.
4. Always give a helpful, natural response like ChatGPT.

Context:
{context}

User Question:
{request.question}
"""

    # Step 4 — call LLM
    response = llm.invoke(final_prompt)

    return {
        "answer": response.content
    }

# =====================================
# PDF UPLOAD
# =====================================
@app.post("/upload/pdf/{user_id}/{subject}")
async def upload_pdf(user_id: str, subject: str, file: UploadFile = File(...)):
    reset_vector_db()  #  fresh DB for each upload

    os.makedirs("uploads/pdfs", exist_ok=True)
    path = f"uploads/pdfs/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(path)

    if not text.strip():
        return {"message": "⚠️ No readable text found in PDF", "chunks_added": 0}

    chunks = index_text(text, {"user_id": user_id, "subject": subject})

    return {"message": "PDF indexed successfully", "chunks_added": chunks}


# =====================================
# IMAGE UPLOAD
# =====================================
@app.post("/upload/image/{user_id}/{subject}")
async def upload_image(user_id: str, subject: str, file: UploadFile = File(...)):
    reset_vector_db()  #  fresh DB for each upload

    os.makedirs("uploads/images", exist_ok=True)
    path = f"uploads/images/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_image(path)

    if not text.strip():
        return {
            "message": "⚠️ No readable text found in image. Upload clearer image.",
            "chunks_added": 0
        }

    chunks = index_text(text, {"user_id": user_id, "subject": subject})

    return {"message": "Image indexed successfully", "chunks_added": chunks}
