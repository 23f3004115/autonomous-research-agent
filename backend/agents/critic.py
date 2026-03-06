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
        SystemMessage(content="""You are a research quality critic. Evaluate reports fairly using this calibrated scale:

Scoring guide:
- 8-10: Exceptional — fully answers the goal, specific data/stats, multiple perspectives, all claims cited
- 6-7:  Good — answers the goal solidly, most claims cited, clear structure, minor gaps acceptable
- 4-5:  Adequate — answers partially, some vague sections, missing key angles or citations
- 1-3:  Poor — misses the goal, mostly generic, few or no citations

Respond in EXACTLY this format:
SCORE: [number 1-10]
CRITIQUE: [specific feedback on what is missing or weak]

Be fair but rigorous. A well-researched, cited report that clearly addresses the goal deserves 7+."""),
        HumanMessage(content=f"""Research Goal: {state['goal']}

Report:
{state['report']}""")
    ])

    lines = response.content.strip().split("\n")
    score = 0
    critique = ""

    for line in lines:
        if line.startswith("SCORE:"):
            try:
                score = int(line.replace("SCORE:", "").strip())
            except ValueError:
                score = 5
        elif line.startswith("CRITIQUE:"):
            critique = line.replace("CRITIQUE:", "").strip()

    print(f"   Score: {score}/10")
    print(f"   Critique: {critique[:100]}...")

    return {
        "score": score,
        "critique": critique,
    }
