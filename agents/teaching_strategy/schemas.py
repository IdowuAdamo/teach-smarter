"""
Pydantic Schemas for Teaching Strategy Agent.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class InterventionGrouping(BaseModel):
    group_name: str = Field(description="Descriptive name (e.g., 'Negative Exponents Remediation Cluster')")
    group_type: str = Field(description="'REMEDIAL_SMALL_GROUP', 'PEER_TUTORING_PAIR', or 'EXTENSION_CHALLENGE'")
    target_topic: str = Field(description="Sub-topic targeted")
    member_tokens: List[str] = Field(description="Pseudonym tokens of students placed in this group")
    rationale: str = Field(description="Why these students were selected based on diagnostic evidence")
    recommended_duration_minutes: int = Field(default=15)


class RemedialActivity(BaseModel):
    topic: str
    title: str
    description: str = Field(description="Concrete step-by-step 10-15 minute classroom activity")
    resource_link_or_tool: str = Field(description="Curriculum reference or recommended open educational resource")
    target_tokens: List[str] = Field(description="Students who need this remedial work")


class ExtensionActivity(BaseModel):
    topic: str
    title: str
    description: str = Field(description="Advanced or creative challenge activity for high-mastery students")
    target_tokens: List[str] = Field(description="Students ready for extension")


class TeachingStrategyReport(BaseModel):
    classroom_id: str
    assessment_title: str
    executive_strategy: str = Field(description="High-level pedagogical recommendations for next 1-2 weeks")
    groupings: List[InterventionGrouping]
    remedial_exercises: List[RemedialActivity]
    extension_activities: List[ExtensionActivity]

