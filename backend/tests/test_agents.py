"""
Unit and Integration Tests for Student Diagnostics & Teaching Strategy Agents.

Verifies:
1. Local Privacy Vault (FERPA pseudonymization & re-hydration).
2. Student Diagnostics Agent structured output and evidence citations.
3. Teaching Strategy Agent constraint-based groupings.
4. API endpoints for diagnostics and teacher recommendation status management.
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.core.database import init_tables
from agents.shared.privacy_vault import PrivacyVault
from agents.student_diagnostics.service import run_student_diagnostics
from agents.teaching_strategy.service import run_teaching_strategy


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_tables()


def test_privacy_vault_masking_and_rehydration():
    students_raw = [
        {
            "pseudonym_token": "Student_E81A",
            "first_name": "Marcus",
            "last_name": "Vance",
            "student_number": "STU-803",
            "historical_average": 88.0,
            "latest_percentage": 61.0,
            "score_delta": -27.0,
            "trajectory_label": "DECLINING",
        },
        {
            "pseudonym_token": "Student_B29C",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "student_number": "STU-802",
            "historical_average": 58.0,
            "latest_percentage": 89.0,
            "score_delta": 31.0,
            "trajectory_label": "BREAKTHROUGH",
        },
    ]

    masked, vault_map = PrivacyVault.mask_student_cohort(students_raw)

    assert len(masked) == 2
    # Verify NO raw names exist in the masked payload
    for m in masked:
        assert not hasattr(m, "first_name")
        assert not hasattr(m, "last_name")
        assert m.pseudonym_token.startswith("Student_")

    # Verify rehydration
    ai_generated_text = "Student_E81A requires review in exponents, while Student_B29C achieved high mastery."
    rehydrated = PrivacyVault.rehydrate_text(ai_generated_text, vault_map)

    assert "Marcus Vance" in rehydrated
    assert "Sarah Jenkins" in rehydrated
    assert "Student_E81A" not in rehydrated


def test_student_diagnostics_agent_execution():
    cohort_data = {
        "total_examinees": 25,
        "mean_percentage": 74.2,
        "systemic_gaps": ["Negative Exponents"],
        "students": [
            {
                "pseudonym_token": "Student_803",
                "historical_average": 88.0,
                "latest_percentage": 61.0,
                "score_delta": -27.0,
                "trajectory_label": "DECLINING",
                "topic_scores": {"Linear Equations": 0.90, "Negative Exponents": 0.20},
            },
            {
                "pseudonym_token": "Student_802",
                "historical_average": 58.0,
                "latest_percentage": 89.0,
                "score_delta": 31.0,
                "trajectory_label": "BREAKTHROUGH",
                "topic_scores": {"Linear Equations": 1.00, "Linear Graphing": 0.90},
            },
        ],
    }

    report = run_student_diagnostics(
        classroom_id="test_class_1",
        classroom_name="Grade 8 Mathematics",
        assessment_title="Unit 3: Linear Equations & Exponents",
        cohort_analytics=cohort_data,
    )

    assert report.classroom_id == "test_class_1"
    assert len(report.individual_diagnostics) >= 1
    for d in report.individual_diagnostics:
        assert d.pseudonym_token != ""
        assert d.trajectory_pattern in ["IMPROVING", "DECLINING", "STABLE", "BREAKTHROUGH", "INSUFFICIENT_DATA"]


def test_teaching_strategy_agent_execution():
    diag_findings = {
        "systemic_topic_gaps": ["Negative Exponents"],
        "students_requiring_intervention": ["Student_803", "Student_804"],
        "students_demonstrating_breakthrough": ["Student_802"],
        "individual_diagnostics": [
            {
                "pseudonym_token": "Student_803",
                "trajectory_pattern": "DECLINING",
                "learning_gaps": ["Negative Exponents"],
                "identified_strengths": ["Solving Linear Equations"],
                "evidence_citation": "Scored 61% down from 88% average",
                "confidence_level": "HIGH",
            }
        ],
    }

    strategy = run_teaching_strategy(
        classroom_id="test_class_1",
        classroom_name="Grade 8 Mathematics",
        assessment_title="Unit 3 Assessment",
        diagnostic_findings=diag_findings,
    )

    assert strategy.classroom_id == "test_class_1"
    assert len(strategy.groupings) >= 1
    # Check constraint: groups should have members and duration
    grp = strategy.groupings[0]
    assert grp.recommended_duration_minutes > 0
    assert len(grp.member_tokens) >= 1


@pytest.mark.asyncio
async def test_diagnostics_and_recommendations_api_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Seed Demo Classroom
        seed_resp = await client.post("/api/v1/demo/load")
        assert seed_resp.status_code == 200
        classroom_id = seed_resp.json()["details"]["classroom_id"]

        # 2. Trigger Student Diagnostics Agent
        diag_resp = await client.post(f"/api/v1/classrooms/{classroom_id}/diagnostics")
        assert diag_resp.status_code == 200
        diag_data = diag_resp.json()
        assert diag_data["status"] == "SUCCESS"
        assert len(diag_data["individual_diagnostics"]) >= 1

        # 3. Trigger Teaching Strategy Agent
        strat_resp = await client.post(f"/api/v1/classrooms/{classroom_id}/teaching-strategy")
        assert strat_resp.status_code == 200
        strat_data = strat_resp.json()
        assert strat_data["status"] == "SUCCESS"
        assert strat_data["recommendations_created"] >= 1

        # 4. List Recommendations
        recs_resp = await client.get(f"/api/v1/classrooms/{classroom_id}/recommendations")
        assert recs_resp.status_code == 200
        recs = recs_resp.json()
        assert len(recs) >= 1
        first_rec_id = recs[0]["id"]
        assert recs[0]["status"] == "PENDING"

        # 5. Teacher accepts recommendation
        patch_resp = await client.patch(
            f"/api/v1/recommendations/{first_rec_id}",
            json={"status": "ACCEPTED", "teacher_notes": "Scheduled for Tuesday advisory period."},
        )
        assert patch_resp.status_code == 200
        patch_data = patch_resp.json()
        assert patch_data["new_status"] == "ACCEPTED"

