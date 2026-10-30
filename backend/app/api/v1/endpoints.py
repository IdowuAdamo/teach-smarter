"""
TeachSmarter REST API Endpoints: v1.

Implements Section 9 & the Spreadsheet-to-Student-Analytics initial development priority:
- Demo classroom seeding
- Spreadsheet inspection & column mapping wizard
- Spreadsheet validation & commit
- Classroom analytics & score distribution
- Assessment item psychometrics & distractor review
"""

import json
from datetime import date
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models import Classroom, Assessment, AssessmentItem, Student, StudentSubmission
from app.security.clerk_auth import TenantContext, get_current_tenant
from app.services.analytics_service import (
    get_classroom_analytics_summary,
    run_assessment_psychometrics,
)
from app.services.demo_seeder import seed_demo_classroom
from app.services.ingestion import (
    commit_import_to_database,
    inspect_dataframe,
    load_file_to_dataframe,
)

router = APIRouter(prefix="/api/v1")


# Schemas
class CommitImportRequest(BaseModel):
    classroom_id: str
    assessment_title: str
    assessment_date: date = Field(default_factory=date.today)
    column_mappings: Dict[str, str]  # { "Detected Column": "target_field" }
    answer_keys: Optional[Dict[int, str]] = None  # { 1: "A", 2: "C", ... }
    rows_data: List[Dict[str, Any]]  # data to commit from the validated upload


@router.post("/demo/load", summary="Load Grade 8 Math Synthetic Demo Classroom")
async def load_demo_classroom(
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    """Seed the Grade 8 Mathematics 25-student demo cohort and run deterministic psychometrics."""
    result = await seed_demo_classroom(session, tenant.organisation_id)
    return {
        "message": "Grade 8 Math Demo Classroom successfully loaded.",
        "details": result,
    }


@router.get("/classrooms", summary="List All Classrooms for Organisation")
async def list_classrooms(
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Classroom)
        .options(selectinload(Classroom.students), selectinload(Classroom.assessments))
        .where(Classroom.organisation_id == tenant.organisation_id)
    )
    res = await session.execute(stmt)
    classrooms = res.scalars().all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "subject": c.subject,
            "grade_level": c.grade_level,
            "student_count": len(c.students),
            "assessment_count": len(c.assessments),
            "created_at": c.created_at.isoformat(),
        }
        for c in classrooms
    ]


@router.get("/classrooms/{classroom_id}", summary="Get Classroom Detail")
async def get_classroom(
    classroom_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Classroom)
        .options(selectinload(Classroom.assessments))
        .where(
            Classroom.id == classroom_id,
            Classroom.organisation_id == tenant.organisation_id,
        )
    )
    res = await session.execute(stmt)
    classroom = res.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    return {
        "id": classroom.id,
        "name": classroom.name,
        "subject": classroom.subject,
        "grade_level": classroom.grade_level,
        "assessments": [
            {
                "id": a.id,
                "title": a.title,
                "max_score": a.max_score,
                "date_administered": str(a.date_administered),
            }
            for a in classroom.assessments
        ],
    }


@router.get("/classrooms/{classroom_id}/analytics", summary="Get Classroom Performance Analytics")
async def get_classroom_analytics(
    classroom_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    """Returns class distribution, longitudinal trajectories, and latest test summary."""
    try:
        analytics = await get_classroom_analytics_summary(session, classroom_id)
        return analytics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/assessments/{assessment_id}/item-analysis", summary="Get Assessment Psychometrics")
async def get_assessment_item_analysis(
    assessment_id: str,
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    """Returns question-level Classical Item Analysis: difficulty p, discrimination D, point-biserial r, and distractors."""
    # Verify assessment belongs to this tenant
    stmt = select(Assessment).where(
        Assessment.id == assessment_id,
        Assessment.organisation_id == tenant.organisation_id,
    )
    res = await session.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    reports = await run_assessment_psychometrics(session, assessment_id)
    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "max_score": assessment.max_score,
        "items_count": len(reports),
        "items": reports,
    }


@router.post("/imports/inspect", summary="Inspect Uploaded Spreadsheet & Propose Mapping")
async def inspect_spreadsheet_upload(
    file: UploadFile = File(...),
    tenant: TenantContext = Depends(get_current_tenant),
):
    """
    Parses CSV or XLSX gradebook and applies deterministic header matching.
    Returns preview rows and proposed column mappings for teacher review.
    """
    try:
        content = await file.read()
        df = load_file_to_dataframe(content, file.filename or "gradebook.csv")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to read spreadsheet: {str(e)}",
        )

    report = inspect_dataframe(df, file.filename or "upload.csv")

    # Serialize sample preview
    preview_rows = df.head(5).fillna("").to_dict(orient="records")

    return {
        "filename": report.filename,
        "total_rows": report.total_rows,
        "total_columns": report.total_columns,
        "is_ambiguous": report.is_ambiguous,
        "requires_confirmation": report.requires_confirmation,
        "detected_items_count": report.detected_items_count,
        "column_mappings": [
            {
                "detected_column": m.detected_column,
                "suggested_target": m.suggested_target,
                "confidence": m.confidence,
                "item_number": m.item_number,
                "is_ambiguous": m.is_ambiguous,
                "sample_values": m.sample_values,
            }
            for m in report.mappings
        ],
        "validation_issues": [
            {
                "row_number": iss.row_number,
                "column_name": iss.column_name,
                "issue_type": iss.issue_type,
                "message": iss.message,
            }
            for iss in report.validation_issues
        ],
        "preview_rows": preview_rows,
        # Return all rows serializable so frontend can confirm without re-uploading file
        "all_rows": df.fillna("").to_dict(orient="records"),
    }


@router.post("/imports/commit", summary="Commit Validated Import into Database")
async def commit_import(
    req: CommitImportRequest,
    tenant: TenantContext = Depends(get_current_tenant),
    session: AsyncSession = Depends(get_db),
):
    """
    Teacher explicitly confirms the import mapping.
    Creates students, assessment, submissions, and responses, then runs psychometrics.
    """
    import pandas as pd

    df = pd.DataFrame(req.rows_data)
    if df.empty:
        raise HTTPException(status_code=400, detail="Cannot commit empty dataset")

    # Verify classroom belongs to tenant
    c_stmt = select(Classroom).where(
        Classroom.id == req.classroom_id,
        Classroom.organisation_id == tenant.organisation_id,
    )
    c_res = await session.execute(c_stmt)
    classroom = c_res.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    result = await commit_import_to_database(
        session=session,
        organisation_id=tenant.organisation_id,
        classroom_id=req.classroom_id,
        assessment_title=req.assessment_title,
        assessment_date=req.assessment_date,
        df=df,
        mappings=req.column_mappings,
        answer_keys=req.answer_keys,
    )

    # Automatically compute item psychometrics on newly imported assessment
    if result.get("assessment_id") and result.get("questions_count", 0) > 0:
        await run_assessment_psychometrics(session, result["assessment_id"])

    return {
        "status": "SUCCESS",
        "message": f"Successfully imported assessment '{req.assessment_title}'.",
        "details": result,
    }

