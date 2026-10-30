"""
Parent Communication Service.
"""

from typing import Any, Dict, List
from agents.shared.llm_client import llm_client
from agents.parent_communication.schemas import (
    ParentCommunicationReport,
    ToneAdjustmentResult,
)
from agents.parent_communication.prompts import (
    PARENT_COMMUNICATION_SYSTEM_PROMPT,
    TONE_ADJUSTMENT_SYSTEM_PROMPT,
    build_parent_drafts_prompt,
)


def run_parent_communication(
    classroom_id: str,
    classroom_name: str,
    assessment_title: str,
    candidate_records: List[Dict[str, Any]],
) -> ParentCommunicationReport:
    """
    Executes the Parent Communication Agent to generate email drafts for selected students.
    """
    prompt = build_parent_drafts_prompt(classroom_name, assessment_title, candidate_records)

    report = llm_client.generate_structured(
        prompt=prompt,
        system_prompt=PARENT_COMMUNICATION_SYSTEM_PROMPT,
        response_model=ParentCommunicationReport,
        temperature=0.3,
    )

    report.classroom_id = classroom_id
    report.assessment_title = assessment_title
    return report


def adjust_communication_tone(
    original_body: str,
    adjustment_type: str,
    student_name: str,
) -> ToneAdjustmentResult:
    """
    Applies a 1-click micro-adjustment to an existing communication draft.
    """
    prompt = f"""Target Student Name: {student_name}
Requested Adjustment: {adjustment_type}

Original Email Body:
{original_body}

Apply the requested adjustment while preserving key factual details."""

    result = llm_client.generate_structured(
        prompt=prompt,
        system_prompt=TONE_ADJUSTMENT_SYSTEM_PROMPT,
        response_model=ToneAdjustmentResult,
        temperature=0.3,
    )
    result.applied_adjustment = adjustment_type
    return result

