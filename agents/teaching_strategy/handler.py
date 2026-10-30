"""
AWS Lambda Handler for Teaching Strategy Agent.
"""

from typing import Any, Dict
from agents.teaching_strategy.service import run_teaching_strategy


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint invoked by AWS Step Functions.

    Input event:
    {
      "organisation_id": "uuid",
      "classroom_id": "uuid",
      "classroom_name": "Grade 8 Math",
      "assessment_title": "Unit 3",
      "diagnostic_findings": { ... }
    }
    """
    classroom_id = event.get("classroom_id", "default_class")
    classroom_name = event.get("classroom_name", "Grade 8 Mathematics")
    assessment_title = event.get("assessment_title", "Unit 3 Assessment")
    diagnostic_findings = event.get("diagnostic_findings", {})

    report = run_teaching_strategy(
        classroom_id=classroom_id,
        classroom_name=classroom_name,
        assessment_title=assessment_title,
        diagnostic_findings=diagnostic_findings,
    )

    return {
        "statusCode": 200,
        "teaching_recommendations": report.model_dump(),
    }

