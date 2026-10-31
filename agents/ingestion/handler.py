"""
AWS Lambda Handler for Ingestion Agent.
"""

from typing import Any, Dict
import pandas as pd
from agents.ingestion.service import run_ingestion_agent


def lambda_handler(event: Dict[str, Any], context: Any = None) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint invoked during spreadsheet ingestion workflows.

    Input event:
    {
      "filename": "unit4_gradebook.csv",
      "rows": [ { "Student ID": "STU-801", ... }, ... ]
    }
    """
    filename = event.get("filename", "upload.csv")
    rows = event.get("rows", [])

    if not rows:
        return {
            "statusCode": 400,
            "error": "No row data provided in event payload.",
        }

    df = pd.DataFrame(rows)
    report = run_ingestion_agent(df=df, filename=filename)

    return {
        "statusCode": 200,
        "ingestion_report": report.model_dump(),
    }

