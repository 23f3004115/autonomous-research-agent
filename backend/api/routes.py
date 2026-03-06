import uuid
from db.supabase_client import save_session
from fastapi import APIRouter
from pydantic import BaseModel
from graph.research_graph import research_graph

router = APIRouter()

# Define what the request body looks like
class ResearchRequest(BaseModel):
    goal: str

class ResearchResponse(BaseModel):
    session_id: str
    goal: str
    report: str
    score: int
    iterations: int
    sub_questions: list[str]

@router.post("/research", response_model=ResearchResponse)
async def run_research(request: ResearchRequest):
    session_id = str(uuid.uuid4())
    print(f"\nNew research request: {request.goal[:60]}...")

    initial_state = {
        "goal": request.goal,
        "sub_questions": [],
        "search_results": [],
        "report": "",
        "critique": "",
        "score": 0,
        "iteration": 0,
    }

    final_state = research_graph.invoke(initial_state)

    save_session(session_id, request.goal, final_state["sub_questions"],
                final_state["report"], final_state["score"], final_state["iteration"])

    return ResearchResponse(
        session_id=session_id,
        goal=request.goal,
        report=final_state["report"],
        score=final_state["score"],
        iterations=final_state["iteration"],
        sub_questions=final_state["sub_questions"],
    )

from db.supabase_client import get_all_sessions

@router.get("/sessions")
async def list_sessions():
    return get_all_sessions()
