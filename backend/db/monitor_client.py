import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

# ─── Monitors ─────────────────────────────────────────────────────────────────

def create_monitor(user_id: str, topic: str, schedule: str, email: str) -> dict:
    from datetime import datetime, timezone, timedelta
    next_run = _calc_next_run(schedule)
    result = supabase.table("monitors").insert({
        "user_id": user_id,
        "topic": topic,
        "schedule": schedule,       # "daily" | "weekly" | "monthly"
        "email": email,
        "active": True,
        "next_run": next_run.isoformat(),
    }).execute()
    return result.data[0] if result.data else {}

def get_monitors_for_user(user_id: str) -> list:
    result = (
        supabase.table("monitors")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data

def get_due_monitors() -> list:
    """Returns monitors that are active and due to run."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    result = (
        supabase.table("monitors")
        .select("*")
        .eq("active", True)
        .lte("next_run", now)
        .execute()
    )
    return result.data

def update_monitor_after_run(monitor_id: str, schedule: str, report: str, score: int):
    next_run = _calc_next_run(schedule)
    from datetime import datetime, timezone
    supabase.table("monitors").update({
        "last_run": datetime.now(timezone.utc).isoformat(),
        "last_report": report,
        "last_score": score,
        "next_run": next_run.isoformat(),
    }).eq("id", monitor_id).execute()

def toggle_monitor(monitor_id: str, active: bool):
    supabase.table("monitors").update({"active": active}).eq("id", monitor_id).execute()

def delete_monitor(monitor_id: str):
    supabase.table("monitors").delete().eq("id", monitor_id).execute()

def _calc_next_run(schedule: str):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    if schedule == "daily":
        return now + timedelta(days=1)
    elif schedule == "monthly":
        return now + timedelta(days=30)
    else:  # default: weekly
        return now + timedelta(weeks=1)
