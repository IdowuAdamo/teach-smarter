"""
Demo Classroom Database Seeder.

Loads the programmatic Grade 8 Mathematics demo dataset into the active organisation:
- 25 Students with historical records
- Unit 1, Unit 2, Unit 3 assessments
- Unit 3 item responses with controlled psychometric anomalies
- Runs deterministic psychometrics to pre-populate item analytics and student trajectories.
"""

import json
from datetime import date
from pathlib import Path
from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Organisation,
    Classroom,
    Student,
    Guardian,
    Assessment,
    AssessmentItem,
    StudentSubmission,
    QuestionResponse,
)
from app.services.analytics_service import run_assessment_psychometrics
from app.services.ingestion import generate_pseudonym


async def seed_demo_classroom(
    session: AsyncSession,
    organisation_id: str,
) -> Dict[str, Any]:
    """Seed or re-seed the Grade 8 Math demo classroom."""
    # 1. Load synthetic data JSON
    json_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthetic" / "grade8_math_demo_data.json"
    if not json_path.exists():
        from data.synthetic.generate_demo_data import generate_dataset
        data = generate_dataset()
    else:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

    # 2. Check or create classroom
    c_info = data["classroom"]
    stmt = select(Classroom).where(
        Classroom.organisation_id == organisation_id,
        Classroom.name == c_info["name"],
    )
    res = await session.execute(stmt)
    classroom = res.scalar_one_or_none()

    if classroom:
        # Delete existing demo classroom to allow clean re-seed
        await session.delete(classroom)
        await session.flush()

    classroom = Classroom(
        organisation_id=organisation_id,
        name=c_info["name"],
        subject=c_info["subject"],
        grade_level=c_info["grade_level"],
    )
    session.add(classroom)
    await session.flush()

    # 3. Create assessments
    assessment_map = {}
    for a_data in data["assessments"]:
        a_date = date.fromisoformat(a_data["date_administered"])
        assess = Assessment(
            organisation_id=organisation_id,
            classroom_id=classroom.id,
            title=a_data["title"],
            max_score=float(a_data["max_score"]),
            date_administered=a_date,
        )
        session.add(assess)
        await session.flush()
        assessment_map[a_data["id"]] = assess

    # 4. Create assessment items for Unit 3
    u3_assess = assessment_map["ASSESS-U3"]
    u3_spec = next(a for a in data["assessments"] if a["id"] == "ASSESS-U3")
    item_map = {}

    for q in u3_spec.get("questions", []):
        item = AssessmentItem(
            assessment_id=u3_assess.id,
            item_number=q["num"],
            prompt=q.get("prompt"),
            correct_option=q["key"],
            mark_allocation=1.0,
            topic_tag=q["topic"],
        )
        session.add(item)
        await session.flush()
        item_map[q["num"]] = item

    # 5. Create students, guardians, submissions, and question responses
    students_created = 0
    for s_data in data["students"]:
        stu_num = s_data["student_number"]
        pseudonym = generate_pseudonym(organisation_id, stu_num)
        student = Student(
            organisation_id=organisation_id,
            classroom_id=classroom.id,
            student_number=stu_num,
            first_name=s_data["first_name"],
            last_name=s_data["last_name"],
            pseudonym_token=pseudonym,
        )
        session.add(student)
        await session.flush()
        students_created += 1

        # Guardian
        guardian = Guardian(
            student_id=student.id,
            name=s_data["guardian_name"],
            email=s_data["guardian_email"],
            preferred_language=s_data["preferred_language"],
        )
        session.add(guardian)

        # Historical submissions (U1, U2, U3)
        for h in s_data["history"]:
            assess_obj = assessment_map[h["assessment_id"]]
            raw_s = float(h.get("raw_score", (h["score_pct"] / 100.0) * assess_obj.max_score))
            pct_s = float(h["score_pct"])

            sub = StudentSubmission(
                student_id=student.id,
                assessment_id=assess_obj.id,
                total_score=raw_s,
                percentage=pct_s,
            )
            session.add(sub)
            await session.flush()

            # For Unit 3, add question responses
            if h["assessment_id"] == "ASSESS-U3":
                for resp in s_data["unit3_responses"]:
                    q_num = resp["item_number"]
                    item_obj = item_map[q_num]
                    qr = QuestionResponse(
                        submission_id=sub.id,
                        item_id=item_obj.id,
                        selected_option=resp["selected_option"],
                        is_correct=bool(resp["is_correct"]),
                        score_awarded=float(resp["score"]),
                    )
                    session.add(qr)

    await session.commit()

    # 6. Run psychometrics on Unit 3
    psychometrics_report = await run_assessment_psychometrics(session, u3_assess.id)

    return {
        "status": "SUCCESS",
        "classroom_id": classroom.id,
        "classroom_name": classroom.name,
        "students_seeded": students_created,
        "assessments_seeded": len(assessment_map),
        "unit3_assessment_id": u3_assess.id,
        "items_analyzed": len(psychometrics_report),
    }

