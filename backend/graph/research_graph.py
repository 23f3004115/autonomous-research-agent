from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.planner import planner_node
from agents.searcher import searcher_node
from agents.writer import writer_node
from agents.critic import critic_node

# ── 1. Create the graph with our state schema ──────────────────────
graph = StateGraph(AgentState)

# ── 2. Register all nodes ──────────────────────────────────────────
graph.add_node("planner", planner_node)
graph.add_node("searcher", searcher_node)
graph.add_node("writer", writer_node)
graph.add_node("critic", critic_node)

# ── 3. Set entry point ─────────────────────────────────────────────
graph.set_entry_point("planner")

# ── 4. Fixed edges (always go this direction) ──────────────────────
graph.add_edge("planner", "searcher")
graph.add_edge("searcher", "writer")
graph.add_edge("writer", "critic")

# ── 5. Conditional edge (the retry loop) ──────────────────────────
def should_retry(state: AgentState) -> str:
    if state["score"] >= 6:
        return "end"
    if state.get("iteration", 0) >= 3:
        print("    Max retries reached. Finalizing anyway.")
        return "end"
    print(f"    Score too low. Retrying... (attempt {state.get('iteration', 0)})")
    return "retry"

graph.add_conditional_edges(
    "critic",
    should_retry,
    {
        "end": END,
        "retry": "searcher",
    }
)

# ── 6. Compile into a runnable ─────────────────────────────────────
research_graph = graph.compile()
