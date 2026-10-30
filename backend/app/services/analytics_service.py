"""
Classroom Analytics and Psychometrics Service.

Bridges database records with deterministic analytics modules:
- Computes Classical Item Analysis (p-value, D-value, Point-Biserial, Distractors).
- Updates assessment item psychometrics.
- Evaluates longitudinal trajectories for enrolled students.
- Generates classroom overview diagnostics and topic gap reports.
"""

from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    Classroom,
    Assessment,
    AssessmentItem,
    StudentSubmission,
    QuestionResponse,
    Student,
)
from app.analytics.difficulty import calculate_item_difficulty
from app.analytics.discrimination import calculate_item_discrimination
from app.analytics.correlation import calculate_point_biserial
from app.analytics.distractors import analyze_distractors
from app.analytics.trajectories import calculate_student_trajectory, HistoricalRecord
from app.analytics.class_summary import calculate_class_summary


async def run_assessment_psychometrics(
    session: AsyncSession,
    assessment_id: str,
) -> List[Dict[str, Any]]:
    """
    Run complete deterministic psychometric item analysis for an assessment.
    Updates the database assessment_items with p-value, D-value, r, and flags.
    """
    # 1. Fetch assessment with items
    stmt = (
        select(Assessment)
        .options(selectinload(Assessment.items))
        .where(Assessment.id == assessment_id)
    )
    res = await session.execute(stmt)
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise ValueError(f"Assessment {assessment_id} not found")

    # 2. Fetch all submissions and their question responses
    sub_stmt = (
        select(StudentSubmission)
        .options(selectinload(StudentSubmission.responses))
        .where(StudentSubmission.assessment_id == assessment_id)
    )
    sub_res = await session.execute(sub_stmt)
    submissions = sub_res.scalars().all()

    if not submissions:
        return []

    # Map submission total score by submission_id
    total_scores = [s.total_score for s in submissions]

    item_reports = []

    for item in sorted(assessment.items, key=lambda x: x.item_number):
        # Gather responses for this item across examinees
        item_scores = []
        selected_opts = []

        for sub in submissions:
            q_resp = next((r for r in sub.responses if r.item_id == item.id), None)
            if q_resp:
                item_scores.append(1 if q_resp.is_correct else 0)
                selected_opts.append(q_resp.selected_option or "")
            else:
                item_scores.append(0)
                selected_opts.append("")

        # 1. Difficulty
        diff_res = calculate_item_difficulty(f"Item_{item.item_number}", item_scores)
        # 2. Discrimination
        disc_res = calculate_item_discrimination(f"Item_{item.item_number}", item_scores, total_scores)
        # 3. Correlation
        corr_res = calculate_point_biserial(f"Item_{item.item_number}", item_scores, total_scores)
        # 4. Distractors
        correct_key = item.correct_option or "A"
        dist_res = analyze_distractors(
            f"Item_{item.item_number}",
            selected_opts,
            total_scores,
            correct_key,
        )

        # Anomaly determination
        anomaly_flag = None
        if dist_res.miskey_suspected:
            anomaly_flag = "MISKEY_SUSPECTED"
        elif disc_res.requires_investigation:
            anomaly_flag = "CRITICAL_DISCRIMINATION"
        elif disc_res.discrimination_label == "POOR":
            anomaly_flag = "POOR_DISCRIMINATION"

        # Update ORM item
        item.difficulty_p = diff_res.p_value
        item.discrimination_d = disc_res.d_value
        item.point_biserial_r = corr_res.r_pbis
        item.anomaly_flag = anomaly_flag
        item.plain_english_insight = f"{disc_res.plain_english_indicator} {dist_res.plain_english_summary}"

        item_reports.append({
            "item_number": item.item_number,
            "topic_tag": item.topic_tag,
            "correct_option": correct_key,
            "difficulty_p": diff_res.p_value,
            "difficulty_label": diff_res.difficulty_label,
            "discrimination_d": disc_res.d_value,
            "discrimination_label": disc_res.discrimination_label,
            "point_biserial_r": corr_res.r_pbis,
            "anomaly_flag": anomaly_flag,
            "plain_english_insight": item.plain_english_insight,
            "distractor_summary": dist_res.plain_english_summary,
            "option_breakdown": [
                {
                    "option": b.option,
                    "overall_pct": b.overall_pct,
                    "upper_pct": b.upper_pct,
                    "lower_pct": b.lower_pct,
                    "is_correct_key": b.is_correct_key,
                }
                for b in dist_res.option_breakdown
            ],
        })

    await session.commit()
    return item_reports


async def get_classroom_analytics_summary(
    session: AsyncSession,
    classroom_id: str,
) -> Dict[str, Any]:
    """Retrieve full classroom performance analytics, distributions, and student trajectories."""
    # Fetch classroom
    c_stmt = (
        select(Classroom)
        .options(
            selectinload(Classroom.students).selectinload(Student.submissions).selectinload(StudentSubmission.assessment),
            selectinload(Classroom.assessments).selectinload(Assessment.items),
        )
        .where(Classroom.id == classroom_id)
    )
    c_res = await session.execute(c_stmt)
    classroom = c_res.scalar_one_or_none()
    if not classroom:
        raise ValueError(f"Classroom {classroom_id} not found")

    # Sort assessments chronologically
    sorted_assessments = sorted(classroom.assessments, key=lambda a: a.date_administered)
    latest_assessment = sorted_assessments[-1] if sorted_assessments else None

    # Calculate student trajectories
    student_trajectories = []
    trajectory_counts = {"BREAKTHROUGH": 0, "IMPROVING": 0, "DECLINING": 0, "STABLE": 0, "INSUFFICIENT_DATA": 0}

    for student in classroom.students:
        # Build chronological history
        sub_list = sorted(student.submissions, key=lambda s: s.assessment.date_administered)
        history = [
            HistoricalRecord(
                assessment_id=sub.assessment_id,
                title=sub.assessment.title,
                date=str(sub.assessment.date_administered),
                percentage=sub.percentage,
            )
            for sub in sub_list
        ]

        traj = calculate_student_trajectory(student.id, history)
        trajectory_counts[traj.trajectory_label] = trajectory_counts.get(traj.trajectory_label, 0) + 1

        student_trajectories.append({
            "student_id": student.id,
            "student_number": student.student_number,
            "name": f"{student.first_name} {student.last_name}",
            "pseudonym_token": student.pseudonym_token,
            "assessments_completed": traj.num_assessments,
            "latest_percentage": traj.latest_percentage,
            "historical_average": traj.historical_average,
            "trajectory_label": traj.trajectory_label,
            "evidence_summary": traj.evidence_summary,
        })

    # Latest assessment psychometrics summary
    latest_summary = None
    flagged_questions = []

    if latest_assessment:
        sub_scores = [
            sub.percentage
            for student in classroom.students
            for sub in student.submissions
            if sub.assessment_id == latest_assessment.id
        ]
        class_stats = calculate_class_summary(latest_assessment.id, sub_scores)

        for item in latest_assessment.items:
            if item.anomaly_flag:
                flagged_questions.append({
                    "item_number": item.item_number,
                    "topic_tag": item.topic_tag,
                    "difficulty_p": item.difficulty_p,
                    "discrimination_d": item.discrimination_d,
                    "anomaly_flag": item.anomaly_flag,
                    "plain_english_insight": item.plain_english_insight,
                })

        latest_summary = {
            "assessment_id": latest_assessment.id,
            "title": latest_assessment.title,
            "date": str(latest_assessment.date_administered),
            "total_examinees": class_stats.total_examinees,
            "mean_percentage": class_stats.mean_percentage,
            "median_percentage": class_stats.median_percentage,
            "distribution_bins": class_stats.distribution_bins,
            "flagged_questions": flagged_questions,
        }

    return {
        "classroom_id": classroom.id,
        "name": classroom.name,
        "subject": classroom.subject,
        "grade_level": classroom.grade_level,
        "total_students": len(classroom.students),
        "trajectory_counts": trajectory_counts,
        "latest_assessment": latest_summary,
        "students": student_trajectories,
    }

