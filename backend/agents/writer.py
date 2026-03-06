import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from .state import AgentState

load_dotenv()

llm = ChatOpenAI(
    model=os.getenv("MODEL_NAME"),
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    temperature=0.4,
)

def writer_node(state: AgentState) -> AgentState:
    print("\n  Writer: Synthesizing research into a report...")

    # Format search results into readable text for the LLM
    formatted_results = ""
    for r in state["search_results"]:
        formatted_results += f"\nQuestion: {r['question']}\n"
        formatted_results += f"Source: {r['title']} ({r['url']})\n"
        formatted_results += f"Content: {r['content']}\n"
        formatted_results += "-" * 40 + "\n"

    # Include critique if this is a retry
    critique_section = ""
    if state.get("critique"):
        critique_section = f"\n\nPREVIOUS CRITIQUE TO ADDRESS:\n{state['critique']}"

    response = llm.invoke([
        SystemMessage(content="""You are an expert research analyst, not a summariser.
Your job is to produce a sharp, analytical report — not a bland essay.

Structure your report as:
# [Specific, descriptive title — not generic]

## TL;DR
[3 punchy bullet points. The core findings a busy person needs in 30 seconds.]

## Background & Context
[Why this topic matters now. Set the scene in 2-3 sentences.]

## Key Findings
[Numbered findings. Each one should make a clear, specific point backed by data.
Use: [Source](URL) format for every citation. No claim without a link.]

## Analysis & Implications
[This is where you add VALUE. What do these findings MEAN?
Identify tensions, trade-offs, surprises. Say something that isn't obvious.
What should the reader DO or THINK differently because of this research?]

## Verdict
[Your analytical conclusion. Be direct. Avoid wishy-washy language like "it depends".]

## Sources
[Numbered markdown links: 1. [Title](URL)]

Rules — follow these strictly:
- Every factual claim needs an inline [Title](URL) citation
- Include specific numbers, percentages, or dates wherever sources provide them
- Do NOT summarise — synthesise and interpret
- If the critique flagged weaknesses, directly fix each one
- Write like an analyst, not a Wikipedia editor"""),
        HumanMessage(content=f"""Research Goal: {state['goal']}

Research Findings:
{formatted_results}
{critique_section}""")
    ])

    print("   Report written successfully")
    return {
        "report": response.content,
        "iteration": state.get("iteration", 0) + 1
    }
