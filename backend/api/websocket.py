import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from graph.research_graph import research_graph
from db.supabase_client import save_session

ws_router = APIRouter()

@ws_router.websocket("/ws/research")
async def websocket_research(websocket: WebSocket):
    await websocket.accept()

    try:
        # Wait for the goal from frontend
        data = await websocket.receive_json()
        goal = data.get("goal", "")

        await websocket.send_json({
            "type": "status",
            "agent": "system",
            "message": f"Starting research: {goal}"
        })

        initial_state = {
            "goal": goal,
            "sub_questions": [],
            "search_results": [],
            "report": "",
            "critique": "",
            "score": 0,
            "iteration": 0,
        }

        # Collect the final state from the last event
        final_state = {}

        # Stream step-by-step using LangGraph's stream()
        async for event in research_graph.astream(initial_state):
            for node_name, node_output in event.items():
                # Merge into final_state so we have the complete result at the end
                final_state.update(node_output)

                # Build execution trace for the Searcher: show what was queried and what sources returned
                trace = None
                if node_name == "searcher" and node_output.get("search_results"):
                    from urllib.parse import urlparse
                    seen_queries: dict = {}
                    for r in node_output["search_results"]:
                        q = r.get("question", "")
                        if q not in seen_queries:
                            seen_queries[q] = []
                        domain = urlparse(r.get("url", "")).netloc.replace("www.", "")
                        seen_queries[q].append({"title": r.get("title", ""), "domain": domain, "url": r.get("url", "")})
                    trace = [{"query": q, "sources": srcs} for q, srcs in seen_queries.items()]

                await websocket.send_json({
                    "type": "agent_update",
                    "agent": node_name,
                    "data": {
                        "sub_questions": node_output.get("sub_questions", []),
                        "score": node_output.get("score", 0),
                        "critique": node_output.get("critique", ""),
                        "report": node_output.get("report", ""),
                        "trace": trace,
                    }
                })

        # Save the completed session to Supabase for history
        session_id = str(uuid.uuid4())
        try:
            save_session(
                session_id,
                goal,
                final_state.get("sub_questions", []),
                final_state.get("report", ""),
                final_state.get("score", 0),
                final_state.get("iteration", 1),
            )
            print(f"   Session saved to Supabase (id: {session_id[:8]}...)")
        except Exception as e:
            print(f"   [Error] Failed to save session to Supabase: {e}")

        await websocket.send_json({
            "type": "done",
            "message": "Research complete"
        })

    except WebSocketDisconnect:
        print("Client disconnected")
