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
    temperature=0.3,
)

def critic_node(state: AgentState) -> AgentState:
    print("\n Critic: Evaluating the report...")

    response = llm.invoke([
        SystemMessage(content="""You are a demanding research quality critic at a top-tier firm.
You evaluate intelligence briefs, NOT essays. Be ruthless about quality.

Scoring rubric:
- 8-10: Analyst-grade — specific data (numbers, $, %), original analysis, bold conclusions, every claim cited, comparison tables where applicable
- 6-7: Strong — most claims cited with data, clear structure, addresses the goal with some specifics, minor gaps
- 4-5: Essay-like — reads like a blog post or Wikipedia summary, vague language, few numbers, mostly descriptive not analytical
- 1-3: Garbage — generic, no citations, doesn't answer the research goal

AUTOMATIC PENALTIES (subtract 2 points each):
- Contains filler phrases: "This is a complex topic", "There are many factors", "It depends"
- More than 1 paragraph without a citation or specific number
- No comparison or contrast between alternatives/competitors
- Missing a clear recommendation or prediction in the conclusion
- No tables when comparing 3+ items with quantitative data

Respond in EXACTLY this format:
SCORE: [number 1-10]
CRITIQUE: [List each specific weakness. For each, say exactly what the writer should add/fix. Be concrete: "Add revenue numbers for Company X" not "needs more data"]

Do NOT give 7+ to reports that read like generic essays. Data density is king."""),
        HumanMessage(content=f"""Research Goal: {state['goal']}

Report:
{state['report']}""")
    ])

    import re
    content = response.content.strip()

    # Capture full multi-line critique (previously only grabbed first line)
    score_match = re.search(r"SCORE:\s*(\d+)", content)
    critique_match = re.search(r"CRITIQUE:\s*(.+)", content, re.DOTALL)

    try:
        score = int(score_match.group(1)) if score_match else 5
    except (ValueError, AttributeError):
        score = 5

    critique = critique_match.group(1).strip() if critique_match else ""

    print(f"   Score: {score}/10")
    print(f"   Critique: {critique[:120]}...")

    return {
        "score": score,
        "critique": critique,
    }
