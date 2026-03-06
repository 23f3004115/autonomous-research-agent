import os
from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

results = client.search(
    query="What is LangGraph and how does it actually work?",
    max_results=3,
)

print("Answer: ", results.get("answer", "No answer"))
print("\nSources")

for r in results["results"]:
    print(f"  - {r["title"]}")
    print(f".   {r['url']}")
