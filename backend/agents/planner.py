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
    temperature=0.7,
)

def planner_node(state: AgentState) -> AgentState:
    print("\nPlanner: Breaking down the research goal......")

    response = llm.invoke([
        SystemMessage(content="""You are a research planner.
Given a research goal, break it into 3 to 6 focused sub-questions depending on the complexity.
Simple, narrow topics need 3. Broad, multi-faceted topics need up to 6.
Output ONLY a numbered list like:
1. question one
2. question two
3. question three
No extra text. No explanations."""),
        HumanMessage(content=f"Research goal: {state['goal']}")
    ])

    # Parse the numbered list into a Python list
    lines = response.content.strip().split("\n")
    sub_questions = [
        line.split(". ", 1)[1].strip()
        for line in lines
        if line.strip() and line[0].isdigit()
    ]

    print(f"   Generated {len(sub_questions)} sub-questions")
    return {"sub_questions": sub_questions}
