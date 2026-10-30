"""
SQLAlchemy 2.0 Multi-Tenant Database Models for TeachSmarter.

Every school-owned record is strictly scoped with an `organisation_id` foreign key.
"""

import uuid
from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def gen_uuid() -> str:
    return str(uuid.uuid4())


class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    clerk_org_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    jurisdiction: Mapped[str] = mapped_column(String(50), default="NG")  # 'NG', 'US', 'UK', etc.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    memberships: Mapped[List["OrganisationMembership"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")
    classrooms: Mapped[List["Classroom"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")
    students: Mapped[List["Student"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")
    assessments: Mapped[List["Assessment"]] = relationship(back_populates="organisation", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    clerk_user_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(100))
    last_name: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    memberships: Mapped[List["OrganisationMembership"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class OrganisationMembership(Base):
    __tablename__ = "organisation_memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), default="TEACHER")  # 'OWNER', 'ADMIN', 'TEACHER'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    organisation: Mapped["Organisation"] = relationship(back_populates="memberships")
    user: Mapped["User"] = relationship(back_populates="memberships")

    __table_args__ = (
        UniqueConstraint("organisation_id", "user_id", name="uq_org_user"),
    )


class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    grade_level: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    organisation: Mapped["Organisation"] = relationship(back_populates="classrooms")
    students: Mapped[List["Student"]] = relationship(back_populates="classroom", cascade="all, delete-orphan")
    assessments: Mapped[List["Assessment"]] = relationship(back_populates="classroom", cascade="all, delete-orphan")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    classroom_id: Mapped[str] = mapped_column(ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    student_number: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    pseudonym_token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    organisation: Mapped["Organisation"] = relationship(back_populates="students")
    classroom: Mapped["Classroom"] = relationship(back_populates="students")
    guardians: Mapped[List["Guardian"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    submissions: Mapped[List["StudentSubmission"]] = relationship(back_populates="student", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organisation_id", "student_number", name="uq_org_student_num"),
    )


class Guardian(Base):
    __tablename__ = "guardians"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    relationship_type: Mapped[Optional[str]] = mapped_column(String(50))  # 'Mother', 'Father', 'Guardian'
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")

    student: Mapped["Student"] = relationship(back_populates="guardians")


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    classroom_id: Mapped[str] = mapped_column(ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    max_score: Mapped[float] = mapped_column(Float, nullable=False)
    date_administered: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    organisation: Mapped["Organisation"] = relationship(back_populates="assessments")
    classroom: Mapped["Classroom"] = relationship(back_populates="assessments")
    items: Mapped[List["AssessmentItem"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")
    submissions: Mapped[List["StudentSubmission"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")


class AssessmentItem(Base):
    __tablename__ = "assessment_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    item_number: Mapped[int] = mapped_column(Integer, nullable=False)
    prompt: Mapped[Optional[str]] = mapped_column(Text)
    correct_option: Mapped[Optional[str]] = mapped_column(String(10))
    mark_allocation: Mapped[float] = mapped_column(Float, default=1.0)
    topic_tag: Mapped[Optional[str]] = mapped_column(String(100), index=True)

    # Deterministic Psychometrics Cache
    difficulty_p: Mapped[Optional[float]] = mapped_column(Float)
    discrimination_d: Mapped[Optional[float]] = mapped_column(Float)
    point_biserial_r: Mapped[Optional[float]] = mapped_column(Float)
    anomaly_flag: Mapped[Optional[str]] = mapped_column(String(50))
    plain_english_insight: Mapped[Optional[str]] = mapped_column(Text)

    assessment: Mapped["Assessment"] = relationship(back_populates="items")
    responses: Mapped[List["QuestionResponse"]] = relationship(back_populates="item", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("assessment_id", "item_number", name="uq_assess_item_num"),
    )


class StudentSubmission(Base):
    __tablename__ = "student_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    total_score: Mapped[float] = mapped_column(Float, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, nullable=False)
    trajectory_label: Mapped[Optional[str]] = mapped_column(String(50))  # 'IMPROVING', 'DECLINING', 'STABLE', 'BREAKTHROUGH'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped["Student"] = relationship(back_populates="submissions")
    assessment: Mapped["Assessment"] = relationship(back_populates="submissions")
    responses: Mapped[List["QuestionResponse"]] = relationship(back_populates="submission", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("student_id", "assessment_id", name="uq_student_assessment"),
    )


class QuestionResponse(Base):
    __tablename__ = "question_responses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    submission_id: Mapped[str] = mapped_column(ForeignKey("student_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("assessment_items.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option: Mapped[Optional[str]] = mapped_column(String(10))
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    score_awarded: Mapped[float] = mapped_column(Float, nullable=False)

    submission: Mapped["StudentSubmission"] = relationship(back_populates="responses")
    item: Mapped["AssessmentItem"] = relationship(back_populates="responses")


class CommunicationDraft(Base):
    __tablename__ = "communication_drafts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id: Mapped[str] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    guardian_id: Mapped[Optional[str]] = mapped_column(ForeignKey("guardians.id", ondelete="SET NULL"), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    content_version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # 'PENDING', 'APPROVED', 'EDITED', 'SENT', 'REJECTED'
    approved_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approval_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    approved_content_hash: Mapped[Optional[str]] = mapped_column(String(64))
    sent_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    delivery_status: Mapped[Optional[str]] = mapped_column(String(50))
    provider_message_id: Mapped[Optional[str]] = mapped_column(String(255))
    target_language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student: Mapped["Student"] = relationship()
    guardian: Mapped[Optional["Guardian"]] = relationship()



class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(100), nullable=False)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class DiagnosticFinding(Base):
    __tablename__ = "diagnostic_findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    classroom_id: Mapped[str] = mapped_column(ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    pedagogical_summary: Mapped[str] = mapped_column(Text, nullable=False)
    findings_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class TeachingRecommendation(Base):
    __tablename__ = "teaching_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    organisation_id: Mapped[str] = mapped_column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    classroom_id: Mapped[str] = mapped_column(ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    recommendation_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'GROUPING', 'REMEDIAL', 'EXTENSION'
    target_topic: Mapped[str] = mapped_column(String(100), nullable=False)
    target_students_json: Mapped[list] = mapped_column(JSON, nullable=False)
    action_plan: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # 'PENDING', 'ACCEPTED', 'REJECTED', 'MODIFIED'
    teacher_notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


