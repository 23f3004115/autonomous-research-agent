"""
Background scheduler — runs every 15 minutes and fires any monitors that are due.
Attach to FastAPI lifespan so it starts/stops with the server.
"""
import uuid
import secrets
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler

from db.monitor_client import get_due_monitors, update_monitor_after_run
from db.supabase_client import save_session
from graph.research_graph import research_graph
from notifications.sender import send_report_email

scheduler = BackgroundScheduler(timezone="UTC")

def _run_monitor(monitor: dict):
    """Execute a single monitor: research → save → email."""
    print(f"\n[Scheduler] Running monitor: {monitor['topic'][:60]}...")

    initial_state = {
        "goal": monitor["topic"],
        "sub_questions": [],
        "search_results": [],
        "report": "",
        "critique": "",
        "score": 0,
        "iteration": 0,
    }

    try:
        final_state = research_graph.invoke(initial_state)
    except Exception as e:
        print(f"[Scheduler] Research failed for monitor {monitor['id']}: {e}")
        return

    # Generate share slug
    slug = secrets.token_urlsafe(8)
    session_id = str(uuid.uuid4())

    save_session(
        session_id,
        monitor["topic"],
        final_state.get("sub_questions", []),
        final_state.get("report", ""),
        final_state.get("score", 0),
        final_state.get("iteration", 1),
        share_slug=slug,
    )

    # Update monitor with results + schedule next run
    update_monitor_after_run(
        monitor["id"],
        monitor["schedule"],
        final_state.get("report", ""),
        final_state.get("score", 0),
    )

    # Send email if monitor has one
    if monitor.get("email"):
        share_url = f"{_get_app_url()}/r/{slug}"
        send_report_email(
            to_email=monitor["email"],
            topic=monitor["topic"],
            report=final_state.get("report", ""),
            score=final_state.get("score", 0),
            share_url=share_url,
        )

    print(f"[Scheduler] ✓ Monitor complete. Score: {final_state.get('score', 0)}/10")


def _poll_and_run_due_monitors():
    """Called every 15 min by the scheduler — checks for due monitors and runs them."""
    print(f"\n[Scheduler] Polling for due monitors at {datetime.now(timezone.utc).strftime('%H:%M UTC')}...")
    due = get_due_monitors()
    if not due:
        print("[Scheduler] No monitors due.")
        return
    print(f"[Scheduler] Found {len(due)} due monitor(s). Running...")
    for monitor in due:
        _run_monitor(monitor)


def start_scheduler():
    scheduler.add_job(
        _poll_and_run_due_monitors,
        trigger="interval",
        minutes=15,
        id="monitor_poll",
        replace_existing=True,
    )
    scheduler.start()
    print("[Scheduler] Started — polling every 15 minutes for due monitors.")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Stopped.")


def _get_app_url() -> str:
    import os
    return os.getenv("APP_URL", "http://localhost:3000")
