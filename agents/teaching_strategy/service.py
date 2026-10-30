"""
Teaching Strategy Service.
"""

from typing import Any, Dict
from agents.shared.llm_client import llm_client
from agents.teaching_strategy.schemas import TeachingStrategyReport
from agents.teaching_strategy.prompts import (
    TEACHING_STRATEGY_SYSTEM_PROMPT,
    build_strategy_prompt,
)


def run_teaching_strategy(
    classroom_id: str,
    classroom_name: str,
    assessment_title: str,
    diagnostic_findings: Dict[str, Any],
) -> TeachingStrategyReport:
    """
    Executes the Teaching Strategy Agent with structured output.
    """
    prompt = build_strategy_prompt(classroom_name, assessment_title, diagnostic_findings)

    report = llm_client.generate_structured(
        prompt=prompt,
        system_prompt=TEACHING_STRATEGY_SYSTEM_PROMPT,
        response_model=TeachingStrategyReport,
        temperature=0.2,
    )

    report.classroom_id = classroom_id
    report.assessment_title = assessment_title
    return report

