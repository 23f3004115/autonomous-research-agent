import asyncio
import websockets
import json

async def test():
    uri = "wss://research-agent-backend-2n03.onrender.com/ws/research"
    try:
        async with websockets.connect(uri) as ws:
            await ws.send(json.dumps({"goal": "What is FastAPI?"}))
            while True:
                resp = await ws.recv()
                print("Received:", resp[:200])
                data = json.loads(resp)
                if data.get("type") == "done":
                    break
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
