"""
Assessment Intelligence Service.
"""

from typing import Any, Dict, List
from agents.shared.llm_client import llm_client
from agents.assessment_intelligence.schemas import AssessmentQualityReport
from agents.assessment_intelligence.prompts import (
    ASSESSMENT_INTELLIGENCE_SYSTEM_PROMPT,
    build_assessment_review_prompt,
)


def run_assessment_intelligence(
    assessment_id: str,
    assessment_title: str,
    items_data: List[Dict[str, Any]],
) -> AssessmentQualityReport:
    """
    Executes the Assessment Intelligence Agent with structured output.
    """
    prompt = build_assessment_review_prompt(assessment_title, items_data)

    report = llm_client.generate_structured(
        prompt=prompt,
        system_prompt=ASSESSMENT_INTELLIGENCE_SYSTEM_PROMPT,
        response_model=AssessmentQualityReport,
        temperature=0.1,
    )

    report.assessment_id = assessment_id
    report.assessment_title = assessment_title
    return report

