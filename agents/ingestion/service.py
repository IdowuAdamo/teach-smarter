"""
Ingestion Intelligence Agent Service.
"""

from typing import Any, Dict, List
import pandas as pd

from app.services.ingestion import inspect_dataframe, IngestionReport
from agents.shared.llm_client import llm_client
from agents.ingestion.schemas import (
    IngestionAnalysisReport,
    ColumnMappingSuggestion,
    ValidationIssueItem,
)
from agents.ingestion.prompts import (
    INGESTION_SYSTEM_PROMPT,
    build_column_disambiguation_prompt,
)


def run_ingestion_agent(
    df: pd.DataFrame,
    filename: str = "gradebook.csv",
) -> IngestionAnalysisReport:
    """
    Executes the Ingestion Agent:
    1. Runs fast deterministic regex/heuristic column matching.
    2. Identifies ambiguous or unrecognized columns.
    3. If ambiguous columns exist, uses structured LLM reasoning to propose resolutions.
    4. Formats and returns an IngestionAnalysisReport.
    """
    # 1. Deterministic baseline inspection
    report: IngestionReport = inspect_dataframe(df, filename)

    mapping_suggestions: List[ColumnMappingSuggestion] = []
    ambiguous_for_llm: List[Dict[str, Any]] = []

    for m in report.mappings:
        suggestion = ColumnMappingSuggestion(
            detected_column=m.detected_column,
            suggested_target=m.suggested_target,
            confidence=m.confidence,
            item_number=m.item_number,
            is_ambiguous=m.is_ambiguous,
            reasoning="Matched via deterministic regex pattern." if m.confidence >= 0.85 else "Low confidence heuristic match.",
        )
        mapping_suggestions.append(suggestion)

        if m.is_ambiguous or m.confidence < 0.60:
            ambiguous_for_llm.append({
                "detected_column": m.detected_column,
                "sample_values": m.sample_values,
            })

    # 2. Resolve ambiguous columns via LLM if available and needed
    if ambiguous_for_llm and llm_client._client:
        try:
            prompt = build_column_disambiguation_prompt(filename, ambiguous_for_llm)
            llm_result = llm_client.generate_structured(
                prompt=prompt,
                system_prompt=INGESTION_SYSTEM_PROMPT,
                response_model=IngestionAnalysisReport,
                temperature=0.1,
            )
            # Merge LLM suggestions for ambiguous columns
            llm_map = {c.detected_column: c for c in llm_result.column_mappings}
            for i, s in enumerate(mapping_suggestions):
                if s.detected_column in llm_map:
                    resolved = llm_map[s.detected_column]
                    mapping_suggestions[i] = resolved
        except Exception:
            # Gracefully keep deterministic suggestions if LLM is unreachable
            pass

    validation_items = [
        ValidationIssueItem(
            row_number=v.row_number,
            column_name=v.column_name,
            issue_type=v.issue_type,
            message=v.message,
        )
        for v in report.validation_issues
    ]

    return IngestionAnalysisReport(
        filename=filename,
        total_rows=report.total_rows,
        total_columns=report.total_columns,
        detected_items_count=report.detected_items_count,
        is_ambiguous=any(m.is_ambiguous for m in mapping_suggestions),
        requires_confirmation=report.requires_confirmation or any(m.is_ambiguous for m in mapping_suggestions),
        column_mappings=mapping_suggestions,
        validation_issues=validation_items,
    )

