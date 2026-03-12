import uuid
import secrets
from db.supabase_client import save_session, get_all_sessions, get_session_by_id, get_session_by_slug
from fastapi import APIRouter, HTTPException
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

@router.get("/sessions")
async def list_sessions():
    return get_all_sessions()

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/sessions/{session_id}/share")
async def create_share_link(session_id: str):
    """Generate a public share slug for a session and return the shareable URL."""
    session = get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # If already has a slug, return it
    if session.get("share_slug"):
        return {"slug": session["share_slug"]}

    # Generate a short random slug
    slug = secrets.token_urlsafe(8)

    from db.supabase_client import supabase
    supabase.table("research_sessions").update({
        "share_slug": slug,
        "is_public": True,
    }).eq("id", session_id).execute()

    return {"slug": slug}

@router.get("/r/{slug}")
async def get_shared_session(slug: str):
    """Public endpoint — no auth needed — for shareable report links."""
    session = get_session_by_slug(slug)
    if not session:
        raise HTTPException(status_code=404, detail="Report not found or not public")
    return session
