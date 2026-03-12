import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

def save_session(session_id: str, goal: str, sub_questions: list,
                 report: str, score: int, iterations: int, share_slug: str = ""):
    data = {
        "id": session_id,
        "goal": goal,
        "sub_questions": sub_questions,
        "report": report,
        "score": score,
        "iterations": iterations,
        "share_slug": share_slug if share_slug else None,
        "is_public": bool(share_slug),
    }
    result = supabase.table("research_sessions").insert(data).execute()
    print(f"   Session saved to Supabase (id: {session_id[:8]}...)")
    return result

def get_all_sessions():
    result = (
        supabase.table("research_sessions")
        .select("id, goal, score, iterations, created_at, share_slug")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data

def get_session_by_id(session_id: str):
    result = (
        supabase.table("research_sessions")
        .select("*")
        .eq("id", session_id)
        .single()
        .execute()
    )
    return result.data

def get_session_by_slug(slug: str):
    result = (
        supabase.table("research_sessions")
        .select("*")
        .eq("share_slug", slug)
        .eq("is_public", True)
        .single()
        .execute()
    )
    return result.data
