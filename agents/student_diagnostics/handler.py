"""
AWS Lambda Handler for Student Diagnostics Agent.
"""

import json
from typing import Any, Dict
from agents.student_diagnostics.service import run_student_diagnostics


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint invoked by AWS Step Functions.

    Input event payload:
    {
      "organisation_id": "uuid",
      "classroom_id": "uuid",
      "classroom_name": "Grade 8 Math",
      "assessment_title": "Unit 3",
      "analytics_results": { ... }
    }
    """
    classroom_id = event.get("classroom_id", "default_class")
    classroom_name = event.get("classroom_name", "Grade 8 Mathematics")
    assessment_title = event.get("assessment_title", "Unit 3 Assessment")
    analytics_results = event.get("analytics_results", {})

    report = run_student_diagnostics(
        classroom_id=classroom_id,
        classroom_name=classroom_name,
        assessment_title=assessment_title,
        cohort_analytics=analytics_results,
    )

    return {
        "statusCode": 200,
        "diagnostic_findings": report.model_dump(),
    }

