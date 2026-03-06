from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    goal: str                          # The user's research goal
    sub_questions: list[str]           # Planner's output: 3-5 questions
    search_results: list[dict]         # Searcher's output: raw web results
    report: str                        # Writer's output: final report
    critique: str                      # Critic's feedback (if retry needed)
    score: int                         # Critic's score: 1-10
    iteration: int                     # How many retry loops we've done

