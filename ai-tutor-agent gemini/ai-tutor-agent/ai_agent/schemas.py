from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: str
    subject: str | None = None
    question: str
    site_context: str | None = None
