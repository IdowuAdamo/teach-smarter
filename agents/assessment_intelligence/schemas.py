"""
Pydantic Schemas for Assessment Intelligence Agent.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ItemPsychometricReview(BaseModel):
    item_number: int
    topic_tag: str
    difficulty_p: float = Field(description="Item difficulty p-value (R/N)")
    discrimination_d: float = Field(description="Kelley's 27% discrimination index (p_U - p_L)")
    anomaly_flag: Optional[str] = Field(description="MISKEY_SUSPECTED, AMBIGUOUS_DISTRACTOR, POOR_DISCRIMINATION, or NONE")
    pedagogical_explanation: str = Field(description="Plain-English explanation grounded strictly in the observed statistics and option distributions")
    suggested_revision: Optional[str] = Field(description="Actionable suggestion for the teacher (e.g. check key, revise distractor, remove double negative)")


class AssessmentQualityReport(BaseModel):
    assessment_id: str
    assessment_title: str
    overall_quality_rating: str = Field(description="'HIGH_VALIDITY', 'MODERATE_WITH_ANOMALIES', 'NEEDS_REVISION'")
    total_items_reviewed: int
    anomalous_items_count: int
    item_reviews: List[ItemPsychometricReview]
    validity_limitations_notice: str = Field(
        default="Psychometric indices are derived from student response patterns. Question text analysis alone cannot establish construct validity."
    )

