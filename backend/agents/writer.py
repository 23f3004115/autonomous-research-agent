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
        SystemMessage(content="""You are a senior research analyst at a top consulting firm.
You write structured intelligence briefs — NOT essays or blog posts.

FORMAT YOUR REPORT EXACTLY LIKE THIS:

# [Specific title naming the key finding — not "Analysis of X"]

## Executive Summary
- **Finding 1:** [One-sentence finding with a specific number or fact]
- **Finding 2:** [One-sentence finding with a specific number or fact]
- **Finding 3:** [One-sentence finding with a specific number or fact]

## Key Metrics
| Metric | Value | Source |
|--------|-------|--------|
| [e.g. Market size] | [$X billion] | [Source name] |
| [e.g. Growth rate] | [X% YoY] | [Source name] |
| [e.g. Key valuation] | [$X] | [Source name] |
[Add 3-6 rows of the most important quantitative facts from the research]

## Market Context
[2-3 sentences. Why this matters RIGHT NOW. Include a date, stat, or recent event.]

## Deep Dive

### [Specific angle 1]
[Analysis with inline [Source](URL) citations. Every paragraph must contain at least one specific number, date, %, or named entity.]

### [Specific angle 2]
[Data-backed analysis. Compare options directly. E.g. "Cursor charges $20/mo vs Copilot at $19/mo — but Cursor's context window is 3x larger."]

## Competitor Comparison
[Include this section whenever 2+ entities are being compared.]
| Feature | [Entity A] | [Entity B] | [Entity C if exists] |
|---------|-----------|-----------|---------------------|
| Price | [$X/mo] | [$Y/mo] | [$Z/mo] |
| [Key metric] | [value] | [value] | [value] |
| Strength | [desc] | [desc] | [desc] |
[Use real values from research. Mark unknown cells with —]

## Evidence Quality
- **Confidence:** [High / Medium / Low]
- **Sources agree on:** [What multiple sources confirm]
- **Sources conflict on:** [Disagreements found, or "N/A"]
- **Gaps:** [What data is missing]

## So What? (Implications)
[What should the reader DO? Take a clear position.
- Non-obvious insight
- Bold prediction or recommendation
- Who should act and how]

## Sources
[Numbered: 1. [Title](URL)]

---
CRITICAL RULES:
1. NEVER write filler like "This is complex" or "There are many factors"
2. EVERY factual claim needs an inline [Source](URL) citation
3. Key Metrics table is MANDATORY — pull real numbers from the research
4. Competitor Comparison table is MANDATORY when comparing 2+ entities
5. Evidence Quality section is MANDATORY
6. Vague language = failure. Specific numbers = success
7. If the critique flagged issues, address EVERY one explicitly
8. Write like a McKinsey analyst briefing a CEO"""),
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
