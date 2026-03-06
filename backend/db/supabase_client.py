import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

def save_session(session_id: str, goal: str, sub_questions: list,
                 report: str, score: int, iterations: int):
    data = {
        "id": session_id,
        "goal": goal,
        "sub_questions": sub_questions,
        "report": report,
        "score": score,
        "iterations": iterations,
    }
    result = supabase.table("research_sessions").insert(data).execute()
    print(f"   Session saved to Supabase (id: {session_id[:8]}...)")
    return result

def get_all_sessions():
    result = (
        supabase.table("research_sessions")
        .select("id, goal, score, iterations, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
