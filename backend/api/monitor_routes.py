from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from db.monitor_client import (
    create_monitor, get_monitors_for_user,
    toggle_monitor, delete_monitor
)

monitor_router = APIRouter(prefix="/monitors", tags=["monitors"])

class MonitorCreate(BaseModel):
    topic: str
    schedule: str = "weekly"   # "daily" | "weekly" | "monthly"
    email: str
    user_id: str               # In production: extract from JWT. Simplified here.

class MonitorToggle(BaseModel):
    active: bool

@monitor_router.post("")
def create(body: MonitorCreate):
    """Create a new monitor."""
    if body.schedule not in ("daily", "weekly", "monthly"):
        raise HTTPException(400, "schedule must be 'daily', 'weekly', or 'monthly'")
    return create_monitor(body.user_id, body.topic, body.schedule, body.email)

@monitor_router.get("/{user_id}")
def list_monitors(user_id: str):
    """List all monitors for a user."""
    return get_monitors_for_user(user_id)

@monitor_router.patch("/{monitor_id}/toggle")
def toggle(monitor_id: str, body: MonitorToggle):
    """Pause or resume a monitor."""
    toggle_monitor(monitor_id, body.active)
    return {"status": "ok", "active": body.active}

@monitor_router.delete("/{monitor_id}")
def remove(monitor_id: str):
    """Delete a monitor permanently."""
    delete_monitor(monitor_id)
    return {"status": "deleted"}
