"""
Student Diagnostics Service.
"""

from typing import Any, Dict
from agents.shared.llm_client import llm_client
from agents.student_diagnostics.schemas import ClassDiagnosticReport
from agents.student_diagnostics.prompts import (
    STUDENT_DIAGNOSTICS_SYSTEM_PROMPT,
    build_diagnostics_prompt,
)


def run_student_diagnostics(
    classroom_id: str,
    classroom_name: str,
    assessment_title: str,
    cohort_analytics: Dict[str, Any],
) -> ClassDiagnosticReport:
    """
    Executes the Student Diagnostics Agent with structured output.
    """
    prompt = build_diagnostics_prompt(classroom_name, assessment_title, cohort_analytics)

    report = llm_client.generate_structured(
        prompt=prompt,
        system_prompt=STUDENT_DIAGNOSTICS_SYSTEM_PROMPT,
        response_model=ClassDiagnosticReport,
        temperature=0.1,
    )

    # Ensure classroom ID is set
    report.classroom_id = classroom_id
    report.assessment_title = assessment_title
    return report

