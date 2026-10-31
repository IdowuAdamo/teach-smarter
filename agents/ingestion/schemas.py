"""
Pydantic Schemas for Ingestion Agent.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ColumnMappingSuggestion(BaseModel):
    detected_column: str = Field(description="Raw column header from uploaded file")
    suggested_target: str = Field(
        description="Standard schema target: student_number, first_name, last_name, full_name, guardian_name, guardian_email, language, item_response, score_total, score_percentage, ignore"
    )
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score of mapping")
    item_number: Optional[int] = Field(default=None, description="Item/question number if target is item_response")
    is_ambiguous: bool = Field(default=False, description="Whether human confirmation is required")
    reasoning: Optional[str] = Field(default=None, description="Rationale for mapping")


class ValidationIssueItem(BaseModel):
    row_number: int
    column_name: str
    issue_type: str = Field(description="ERROR or WARNING")
    message: str


class IngestionAnalysisReport(BaseModel):
    filename: str
    total_rows: int
    total_columns: int
    detected_items_count: int
    is_ambiguous: bool
    requires_confirmation: bool
    column_mappings: List[ColumnMappingSuggestion]
    validation_issues: List[ValidationIssueItem] = Field(default_factory=list)

