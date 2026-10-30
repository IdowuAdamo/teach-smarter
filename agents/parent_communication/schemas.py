"""
Pydantic Schemas for Parent Communication Agent.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class DraftItem(BaseModel):
    student_token: str = Field(description="Pseudonym token of student")
    category: str = Field(description="'BREAKTHROUGH_PRAISE', 'INTERVENTION_NOTICE', or 'WEEKLY_UPDATE'")
    subject: str = Field(description="Clear, encouraging, professional email subject line")
    body: str = Field(description="Personalized draft body adhering to school tone policy")
    target_language: str = Field(default="en", description="Target language ('en', 'es', 'fr', etc.)")
    tone_tags: List[str] = Field(default_factory=list, description="Tags describing tone ('encouraging', 'actionable', etc.)")


class ParentCommunicationReport(BaseModel):
    classroom_id: str
    assessment_title: str
    drafts: List[DraftItem]


class ToneAdjustmentResult(BaseModel):
    modified_body: str = Field(description="Adjusted email text with revised tone or translation")
    applied_adjustment: str
    tone_tags: List[str]

