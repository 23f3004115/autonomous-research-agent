<div align="center">

# Autonomous Research Agent

**An AI-powered research system that plans, searches, writes, and self-critiques — automatically.**

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C1C1C?style=flat-square&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)

[**→ Live Demo**](https://your-vercel-url.vercel.app) &nbsp;·&nbsp; [**Backend API**](https://research-agent-backend-2n03.onrender.com)

</div>

---

## What It Does

Instead of asking an LLM a question and getting one generic answer, this system runs **four specialized agents in a self-correcting loop**:

```
User Goal
    │
    ▼
┌─────────────┐    Breaks the goal into specific sub-questions
│   Planner   │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Searches the web for each sub-question (Tavily API)
│  Searcher   │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Synthesizes data into a cited, analytical report
│   Writer    │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Scores the report (0-10) and writes actionable feedback
│   Critic    │
└──────┬──────┘
       │
   Score ≥ 6? ──No──► Back to Searcher (with critique as context)
       │
      Yes
       │
       ▼
  Final Report
```

The full state machine is orchestrated by **LangGraph** and streamed in real-time to the frontend via **WebSockets**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Agent Orchestration** | LangGraph (StateGraph) |
| **Language Model** | OpenAI GPT (via LangChain) |
| **Web Search** | Tavily API |
| **Backend API** | FastAPI + Uvicorn |
| **Background Jobs** | APScheduler (monitor polling) |
| **Email Notifications** | Resend |
| **Database** | Supabase (PostgreSQL) |
| **Frontend** | Next.js 16 + Tailwind CSS v4 |
| **Real-time** | WebSockets |

---

## Features

- **Multi-agent orchestration** — Planner, Searcher, Writer, and Critic agents with shared state
- **Self-correcting loop** — Critic scores every report; low scores trigger automatic retry with feedback
- **Real-time streaming UI** — WebSocket-powered live agent timeline in the frontend
- **Research monitors** — Set up recurring research on a topic (daily/weekly/monthly) with email delivery
- **Session history** — All completed research sessions saved to Supabase with scores and citations
- **Clickable references** — Writer produces markdown hyperlinks for all cited sources

---

## Local Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- Supabase project
- OpenAI API key
- Tavily API key

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini
TAVILY_API_KEY=tvly-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...
ALLOWED_ORIGINS=http://localhost:3000
# Optional — for email notifications
RESEND_API_KEY=re_...
FROM_EMAIL=Research Agent <noreply@yourdomain.com>
APP_URL=http://localhost:3000
```

Run the Supabase migration in your **Supabase Dashboard → SQL Editor**:
```sql
-- Run supabase_migration.sql
```

```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

**Backend → [Render](https://render.com)**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set all env vars from `backend/.env` in Render's environment settings
- Add `ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`

**Frontend → [Vercel](https://vercel.com)**
- Root directory: `frontend`
- Framework: Next.js (auto-detected)
- Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to your Render URL

---

## Project Structure

```
.
├── backend/
│   ├── agents/          # Planner, Searcher, Writer, Critic agent nodes
│   ├── api/             # FastAPI routes (research, sessions, monitors)
│   ├── db/              # Supabase client + monitor CRUD
│   ├── graph/           # LangGraph StateGraph definition
│   ├── notifications/   # Resend email sender
│   ├── scheduler/       # APScheduler background monitor polling
│   └── main.py          # FastAPI app with lifespan for scheduler
└── frontend/
    ├── app/             # Next.js App Router pages
    ├── components/ui/   # AgentSidebar, ReportView, Icons
    └── lib/             # Supabase client, ResearchContext
```

---

*Built as a portfolio project demonstrating expertise in agentic AI systems, real-time full-stack development, and LLM orchestration with LangGraph.*
