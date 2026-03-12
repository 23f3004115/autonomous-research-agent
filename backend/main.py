import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.websocket import ws_router
from api.monitor_routes import monitor_router
from scheduler.monitor_scheduler import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()     # Start background monitor polling
    yield
    stop_scheduler()      # Clean up on shutdown

app = FastAPI(title="Pulse Research API", version="2.0.0", lifespan=lifespan)

# Read allowed origins from env — falls back to localhost for dev
_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(ws_router)
app.include_router(monitor_router)

@app.get("/")
def health_check():
    return {"status": "running", "message": "Pulse Research API is live", "version": "2.0.0"}
