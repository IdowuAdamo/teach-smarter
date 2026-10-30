"""
AWS Lambda Handler for Parent Communication Agent.
"""

from typing import Any, Dict
from agents.parent_communication.service import run_parent_communication


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint invoked by AWS Step Functions.

    Input event:
    {
      "organisation_id": "uuid",
      "classroom_id": "uuid",
      "classroom_name": "Grade 8 Math",
      "assessment_title": "Unit 3",
      "candidate_records": [ ... ]
    }
    """
    classroom_id = event.get("classroom_id", "default_class")
    classroom_name = event.get("classroom_name", "Grade 8 Mathematics")
    assessment_title = event.get("assessment_title", "Unit 3 Assessment")
    candidate_records = event.get("candidate_records", [])

    report = run_parent_communication(
        classroom_id=classroom_id,
        classroom_name=classroom_name,
        assessment_title=assessment_title,
        candidate_records=candidate_records,
    )

    return {
        "statusCode": 200,
        "communication_drafts": report.model_dump(),
    }

