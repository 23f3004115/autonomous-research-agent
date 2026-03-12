import os
from dotenv import load_dotenv
from tavily import TavilyClient
from concurrent.futures import ThreadPoolExecutor, as_completed
from .state import AgentState

load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def _search_one(question: str, critique: str) -> list[dict]:
    """Search Tavily for a single sub-question. Runs in a thread."""
    search_query = question
    if critique:
        search_query = f"{question} {critique[:100]}"

    results = tavily.search(query=search_query, max_results=3)
    return [
        {
            "question": question,
            "title": r["title"],
            "url": r["url"],
            "content": r["content"][:1500],  # increased from 500 → more data for writer
        }
        for r in results["results"]
    ]

def searcher_node(state: AgentState) -> AgentState:
    print("\n Searcher: Searching the web in parallel...")

    sub_questions = state["sub_questions"]
    critique = state.get("critique", "")
    all_results: list[dict] = []

    # Run all searches concurrently — cuts time from N×(latency) to ~1×(latency)
    with ThreadPoolExecutor(max_workers=len(sub_questions)) as executor:
        futures = {
            executor.submit(_search_one, q, critique): q
            for q in sub_questions
        }
        for i, future in enumerate(as_completed(futures)):
            question = futures[future]
            try:
                results = future.result()
                all_results.extend(results)
                print(f"   ✓ ({i+1}/{len(sub_questions)}) {question[:55]}...")
            except Exception as e:
                print(f"   ✗ Search failed for '{question[:40]}': {e}")

    print(f"   Found {len(all_results)} total results")
    return {
        "search_results": all_results,
        "iteration": state.get("iteration", 0) + 1
    }
