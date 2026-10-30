"""
Pydantic Schemas for Student Diagnostics Agent.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class IndividualDiagnostic(BaseModel):
    pseudonym_token: str = Field(description="Anonymized student token (e.g. Student_A1B2)")
    trajectory_pattern: str = Field(description="IMPROVING, DECLINING, STABLE, BREAKTHROUGH, or INSUFFICIENT_DATA")
    identified_strengths: List[str] = Field(description="Topics or skills where student demonstrated mastery")
    learning_gaps: List[str] = Field(description="Specific sub-topics where student requires reinforcement")
    evidence_citation: str = Field(description="Strict citation of percentage scores, delta, and assessment items")
    confidence_level: str = Field(description="HIGH, MODERATE, or LOW based on historical data points")


class ClassDiagnosticReport(BaseModel):
    classroom_id: str
    assessment_title: str
    cohort_size: int
    systemic_topic_gaps: List[str] = Field(description="Topics with class mastery < 65%")
    students_requiring_intervention: List[str] = Field(description="Tokens of students showing sharp declines or persistent low mastery")
    students_demonstrating_breakthrough: List[str] = Field(description="Tokens of students achieving sudden significant leaps")
    pedagogical_summary: str = Field(description="Executive summary of class performance grounded strictly in observed metrics")
    individual_diagnostics: List[IndividualDiagnostic]

