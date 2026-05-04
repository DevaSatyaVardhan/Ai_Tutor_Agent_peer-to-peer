import requests

from ai_agent.config import TAVILY_API_KEY


def tavily_search(query: str, max_results: int = 5) -> list[dict]:
    if not TAVILY_API_KEY:
        return []

    try:
        response = requests.post(
            "https://api.tavily.com/search",
            headers={"Content-Type": "application/json"},
            json={
                "api_key": TAVILY_API_KEY,
                "query": query,
                "search_depth": "advanced",
                "max_results": max_results,
                "include_answer": True,
            },
            timeout=30,
        )
        data = response.json()

        results = []
        if data.get("answer"):
            results.append(
                {
                    "title": "Tavily Answer",
                    "url": "",
                    "content": data["answer"],
                }
            )

        for result in data.get("results", []):
            results.append(
                {
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content"),
                }
            )

        return results
    except Exception:
        return []


def format_web_results(results: list[dict]) -> str:
    if not results:
        return ""

    lines = []
    for i, result in enumerate(results, start=1):
        title = (result.get("title") or "").strip()
        url = (result.get("url") or "").strip()
        content = (result.get("content") or "").strip()

        header = title if title else f"Result {i}"
        if url:
            header += f" ({url})"

        if content:
            lines.append(f"{i}. {header}\n{content}")

    return "\n\n".join(lines)


def build_live_search_response(query: str, results: list[dict], max_items: int = 5) -> str:
    if not results:
        return ""

    answer_line = ""
    other_results = []
    for result in results:
        if (result.get("title") or "").strip().lower() == "tavily answer":
            answer_line = (result.get("content") or "").strip()
        else:
            other_results.append(result)

    lines = [f"Live web search results for: {query}"]
    if answer_line:
        lines.append(f"Current summary: {answer_line}")

    if other_results:
        lines.append("Sources:")
        for idx, result in enumerate(other_results[:max_items], start=1):
            title = (result.get("title") or f"Result {idx}").strip()
            url = (result.get("url") or "").strip()
            content = (result.get("content") or "").strip()
            snippet = content[:220] + ("..." if len(content) > 220 else "")

            source_line = f"{idx}. {title}"
            if url:
                source_line += f" - {url}"
            if snippet:
                source_line += f"\n   {snippet}"
            lines.append(source_line)

    return "\n".join(lines)
