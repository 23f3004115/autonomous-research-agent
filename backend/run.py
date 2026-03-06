import sys
from dotenv import load_dotenv
from graph.research_graph import research_graph

load_dotenv()

def run_research(goal: str):
    print(f"\n{'='*60}")
    print(f"Starting Research: {goal}")
    print(f"{'='*60}")

    # Initial state — only goal is set, everything else is empty
    initial_state = {
        "goal": goal,
        "sub_questions": [],
        "search_results": [],
        "report": "",
        "critique": "",
        "score": 0,
        "iteration": 0,
    }

    # Run the full graph
    final_state = research_graph.invoke(initial_state)

    # Print the final report
    print(f"\n{'='*60}")
    print(f"FINAL REPORT (Score: {final_state['score']}/10)")
    print(f"{'='*60}")
    print(final_state["report"])
    print(f"\nCompleted in {final_state['iteration']} iteration(s)")

if __name__ == "__main__":
    goal = sys.argv[1] if len(sys.argv) > 1 else "Analyze the current state of AI coding assistant tools"
    run_research(goal)
