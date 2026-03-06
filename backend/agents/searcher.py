import os
from dotenv import load_dotenv
from tavily import TavilyClient
from .state import AgentState

load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def searcher_node(state: AgentState) -> AgentState:
    print("\n Searcher: Searching the web for each sub-question...")

    all_results = []

    for i, question in enumerate(state["sub_questions"]):
        print(f"   Searching ({i+1}/{len(state['sub_questions'])}): {question[:60]}...")

        # If Critic gave feedback, append it to make the search more targeted
        search_query = question
        if state.get("critique"):
            search_query = f"{question} {state['critique'][:100]}"

        results = tavily.search(
            query=search_query,
            max_results=3,
        )

        for r in results["results"]:
            all_results.append({
                "question": question,
                "title": r["title"],
                "url": r["url"],
                "content": r["content"][:500],  # trim to save tokens
            })

    print(f"   Found {len(all_results)} total results")
    return {"search_results": all_results}
