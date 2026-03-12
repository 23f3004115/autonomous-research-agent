import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.graph.research_graph import research_graph
from dotenv import load_dotenv

load_dotenv("backend/.env")

state = {
    "goal": "Give me a detailed analysis on the Palantir's work",
    "sub_questions": [],
    "search_results": [],
    "report": "",
    "critique": "",
    "score": 0,
    "iteration": 0,
}

try:
    for event in research_graph.stream(state):
        print("EVENT:", event.keys())
except Exception as e:
    import traceback
    traceback.print_exc()
