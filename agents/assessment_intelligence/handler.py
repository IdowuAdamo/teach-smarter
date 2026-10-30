"""
AWS Lambda Handler for Assessment Intelligence Agent.
"""

from typing import Any, Dict
from agents.assessment_intelligence.service import run_assessment_intelligence


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint invoked by AWS Step Functions.

    Input event:
    {
      "organisation_id": "uuid",
      "assessment_id": "uuid",
      "assessment_title": "Unit 3 Assessment",
      "item_statistics": [ ... ]
    }
    """
    assessment_id = event.get("assessment_id", "default_assess")
    assessment_title = event.get("assessment_title", "Unit 3 Assessment")
    item_statistics = event.get("item_statistics", [])

    report = run_assessment_intelligence(
        assessment_id=assessment_id,
        assessment_title=assessment_title,
        items_data=item_statistics,
    )

    return {
        "statusCode": 200,
        "assessment_review": report.model_dump(),
    }

