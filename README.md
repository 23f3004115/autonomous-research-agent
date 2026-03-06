# Autonomous Research Agent 🧠

![Autonomous Research Agent](https://img.shields.io/badge/Status-Live-success)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![LangGraph](https://img.shields.io/badge/LangGraph-1C1C1C?style=flat&logo=langchain)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

An advanced, AI-powered autonomous research system that plans, researches, writes, and evaluates comprehensive reports on any given topic. Built with a robust agentic architecture using LangGraph and a real-time streaming frontend.

---

## 🚀 The Pitch

In modern high-stakes environments, simply summarizing the top three Google results isn't enough. I built the **Autonomous Research Agent** to mimic the workflow of a human analyst. Instead of taking a question and vomiting a single LLM response, this system utilizes a **multi-agent orchestration loop (via LangGraph)** to execute deep research:

1. **The Planner** decomposes complex user goals into hyper-specific sub-queries.
2. **The Searcher** iteratively scrapes the web for data on each sub-query.
3. **The Writer** synthesizes the raw data into an analytical, markdown-formatted report with inline citations.
4. **The Critic** strictly evaluates the report against a calibrated rubric (depth, citations, clarity). If the report scores below a 6/10, the Critic writes actionable feedback, and the system **loops back to the Searcher** to try again.

By engineering this self-correcting feedback loop, the system consistently produces high-quality, cited insights that single-shot models cannot achieve. The entire state machine is exposed to the client in **real-time via WebSockets**, rendering a beautiful, interactive timeline in the Next.js frontend as the agents "think" and work. All sessions are persisted to **Supabase** for historical review.

---

## 🛠️ Architecture

### Backend (Python / FastAPI / LangGraph)
- **Agentic Workflow Workflow**: Implemented a StateGraph using `LangGraph` for control flow, state management, and retry logic.
- **LLM Integration**: Uses `langchain-openai` (GPT models) for reasoning and text generation.
- **Data Gathering**: Integrated `Tavily API` for high-quality, real-time web search integration.
- **Streaming**: Exposes a WebSocket endpoint (`/ws/research`) to stream Agentic events step-by-step as they execute.
- **Persistence**: Connects to `Supabase` to save session states, final reports, and sub-questions.

### Frontend (TypeScript / Next.js / Tailwind CSS)
- **Real-time UX**: Connects to the FastAPI WebSocket to parse and render incoming agent graph states (e.g., streaming planner output, animating search progress).
- **Modern UI**: Designed a sleek, dark-mode application using raw CSS variables and Tailwind utilities, featuring interactive SVGs over generic emojis.
- **History View**: Dedicated dashboard to navigate previously generated reports.

---

## 💻 Running Locally

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
*Create a `.env` file in the `backend` directory referencing `.env.example` (requires OpenAI, Tavily, and Supabase keys).*
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
```
*Create a `.env.local` file with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.*
```bash
npm run dev
```

---

## 💡 Key Learnings & Engineering Decisions
- **Deterministic Agent State**: By strictly defining the `AgentState` TypedDict, I ensured reliable context passing between isolated agent nodes (Planner -> Searcher -> Writer -> Critic).
- **WebSocket over Polling**: Chose WebSockets to stream granular graph events (e.g., specific sub-queries generated) rather than polling a database, massively improving perceived performance and UX.
- **Prompt Engineering as Code**: Realized the critical difference between a generic summary and deep analysis lies in prompt structure. Calibrated the "Critic" prompt to be strict but fair, and forced the "Writer" to prioritize interpretation over aggregation.

---
*Built as a portfolio project demonstrating expertise in Agentic AI, modern full-stack web development, and system design.*
