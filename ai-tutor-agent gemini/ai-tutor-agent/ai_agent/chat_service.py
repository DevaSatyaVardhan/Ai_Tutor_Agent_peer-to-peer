import re
from datetime import datetime

from langchain_chroma import Chroma

from ai_agent.config import fallback_llm, llm
from ai_agent.memory_store import memory_add, memory_get_recent
from ai_agent.vector_store import get_vectorstore
from ai_agent.web_search import build_live_search_response, tavily_search


def is_today_date_query(query: str) -> bool:
    q = (query or "").lower().strip()
    return bool(re.search(r"\b(today'?s date|what is today|today date|date today)\b", q))


def is_time_sensitive_query(query: str) -> bool:
    q = (query or "").lower()
    return any(word in q for word in ["today", "latest", "news", "current", "now", "live"])


def is_live_web_query(query: str) -> bool:
    q = (query or "").lower()
    finance_keywords = ["gold rate", "silver rate", "stock price", "crypto price", "exchange rate"]
    weather_keywords = ["weather", "temperature", "forecast"]
    return is_time_sensitive_query(q) or any(k in q for k in finance_keywords + weather_keywords)


def is_document_query(query: str) -> bool:
    q = (query or "").lower()
    keywords = [
        "uploaded",
        "upload",
        "attached",
        "attachment",
        "pdf",
        "image",
        "document",
        "file",
        "notes",
        "summarise",
        "summarize",
        "read the uploaded",
    ]
    return any(keyword in q for keyword in keywords)


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def retrieve_rag_context(vectorstore: Chroma, question: str, k: int = 6) -> str:
    queries = [question]
    if is_document_query(question):
        queries.extend(
            [
                "uploaded document summary",
                "uploaded pdf content",
                "uploaded image text",
                "study material notes",
            ]
        )

    seen: set[str] = set()
    collected: list[str] = []

    for query in queries:
        try:
            docs = vectorstore.similarity_search(query, k=k)
        except Exception:
            continue

        for doc in docs:
            text = (getattr(doc, "page_content", "") or "").strip()
            if not text:
                continue
            key = _clean_text(text)[:240]
            if key in seen:
                continue
            seen.add(key)
            collected.append(text)
            if len(collected) >= k:
                return "\n\n".join(collected)

    return "\n\n".join(collected)


def answer_from_rag_context(question: str, context_text: str, site_context: str, memory_block: str) -> str:
    prompt = (
        "You are an AI tutor. Answer from the provided DOCUMENT CONTEXT first. "
        "Do not say you cannot access attachments when context is present. "
        "If context is insufficient, say exactly what is missing and ask one concise follow-up.\n\n"
        f"QUESTION:\n{question}\n\n"
        f"DOCUMENT CONTEXT:\n{context_text}\n\n"
        f"WEBSITE CONTEXT:\n{site_context}\n\n"
        f"RECENT CHAT:\n{memory_block}\n"
    )
    response = llm.invoke(prompt)
    return getattr(response, "content", str(response))


def answer_from_web(question: str, site_context: str, memory_block: str) -> str:
    web_results = tavily_search(question)
    if not web_results:
        return ""

    return build_live_search_response(question, web_results)


def answer_from_general_knowledge(question: str, site_context: str, memory_block: str) -> str:
    prompt = (
        "You are an AI tutor. Answer directly, clearly, and concisely. "
        "Use website context if relevant.\n\n"
        f"Question: {question}\n"
        f"Website context: {site_context}\n"
        f"Recent chat:\n{memory_block}"
    )
    response = llm.invoke(prompt)
    return getattr(response, "content", str(response))


def answer_with_fallback_model(question: str, site_context: str, memory_block: str) -> str:
    backup_prompt = (
        "You are an AI tutor. Give a clear, concise answer. "
        "If something is uncertain, say so briefly.\n\n"
        f"Question: {question}\n"
        f"Website context: {site_context}\n"
        f"Recent chat:\n{memory_block}"
    )
    response = fallback_llm.invoke(backup_prompt)
    return getattr(response, "content", str(response))


def process_chat(user_id: str, subject: str | None, question: str, site_context: str | None) -> str:
    memory_add(user_id, "user", question)

    if is_today_date_query(question):
        answer = f"Today's date is {datetime.now().strftime('%A, %d %B %Y')}."
        memory_add(user_id, "assistant", answer)
        return answer

    memory_rows = memory_get_recent(user_id)
    memory_block = "\n".join([f"{role}: {content}" for role, content in memory_rows])
    cleaned_site_context = (site_context or "").strip()

    try:
        if is_live_web_query(question):
            web_answer = answer_from_web(question, cleaned_site_context, memory_block)
            answer = web_answer or (
                "I could not fetch live web results right now. "
                "Please retry in a few seconds."
            )
        elif is_document_query(question):
            vectorstore = get_vectorstore(user_id, subject)
            rag_context = retrieve_rag_context(vectorstore, question, k=6)

            if rag_context:
                answer = answer_from_rag_context(question, rag_context, cleaned_site_context, memory_block)
            else:
                answer = (
                    "I couldn't find indexed content for your uploaded file in this subject yet. "
                    "Please re-upload and ask again, or try subject 'General'."
                )
        else:
            vectorstore = get_vectorstore(user_id, subject)
            rag_context = retrieve_rag_context(vectorstore, question, k=6)
            if rag_context:
                answer = answer_from_rag_context(question, rag_context, cleaned_site_context, memory_block)
            else:
                answer = answer_from_general_knowledge(question, cleaned_site_context, memory_block)

    except Exception as exc:
        err = str(exc)
        if "RESOURCE_EXHAUSTED" in err or "429" in err:
            try:
                answer = answer_with_fallback_model(question, cleaned_site_context, memory_block)
            except Exception:
                answer = (
                    "I hit the Gemini free-tier quota limit right now. "
                    "Please retry after a minute or use another API key/model."
                )
        else:
            answer = f"AI model call failed: {err}"

    memory_add(user_id, "assistant", answer)
    return answer
