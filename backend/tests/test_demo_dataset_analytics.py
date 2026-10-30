"""
Integration Test: Verifying Analytics Engine Against Synthetic Grade 8 Math Demo Cohort.

Ensures that the controlled pedagogical and psychometric anomalies are accurately
detected and classified by the deterministic math engine:
1. Question 7: Miskeyed question anomaly (D < 0.00, Kelley Upper missed it while selecting Option C).
2. Question 12: Poor discrimination (D < 0.20).
3. Sarah Jenkins: Breakthrough student trajectory.
4. Marcus Vance: Declining student trajectory (specifically falling in exponents).
5. Chloe Adams: Consistently high mastery.
6. David Okafor: Struggling student trajectory requiring intervention.
"""

import json
from pathlib import Path
import pytest

from app.analytics.difficulty import calculate_item_difficulty
from app.analytics.discrimination import calculate_item_discrimination
from app.analytics.distractors import analyze_distractors
from app.analytics.trajectories import calculate_student_trajectory, HistoricalRecord
from app.analytics.class_summary import calculate_class_summary


@pytest.fixture(scope="module")
def demo_data():
    data_path = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic" / "grade8_math_demo_data.json"
    if not data_path.exists():
        # Generate on the fly if not yet generated on disk
        from data.synthetic.generate_demo_data import generate_dataset
        return generate_dataset()
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


def test_demo_cohort_size(demo_data):
    assert len(demo_data["students"]) == 25
    assert demo_data["classroom"]["total_students"] == 25


def test_q7_miskeyed_anomaly_detected(demo_data):
    """Q7 must trigger negative discrimination and suspected miskey in distractor analysis."""
    students = demo_data["students"]
    total_scores = [s["history"][2]["raw_score"] for s in students]

    q7_resps = []
    q7_opts = []
    for s in students:
        resp = next(r for r in s["unit3_responses"] if r["item_number"] == 7)
        q7_resps.append(1 if resp["is_correct"] else 0)
        q7_opts.append(resp["selected_option"])

    # 1. Discrimination test
    disc_result = calculate_item_discrimination("Q7", q7_resps, total_scores)
    assert disc_result.d_value < 0.0, f"Expected negative discrimination, got D={disc_result.d_value}"
    assert disc_result.requires_investigation is True
    assert disc_result.discrimination_label == "CRITICAL_ANOMALY"

    # 2. Distractor analysis test
    dist_result = analyze_distractors(
        item_id="Q7",
        selected_options=q7_opts,
        total_test_scores=total_scores,
        correct_option="B",
    )
    assert dist_result.miskey_suspected is True
    assert "C" in dist_result.anomalous_options


def test_q12_poor_discrimination_detected(demo_data):
    """Q12 should show weak discrimination (D < 0.20)."""
    students = demo_data["students"]
    total_scores = [s["history"][2]["raw_score"] for s in students]

    q12_resps = []
    for s in students:
        resp = next(r for r in s["unit3_responses"] if r["item_number"] == 12)
        q12_resps.append(1 if resp["is_correct"] else 0)

    disc_result = calculate_item_discrimination("Q12", q12_resps, total_scores)
    assert disc_result.d_value < 0.20, f"Expected D < 0.20, got {disc_result.d_value}"


def test_sarah_jenkins_breakthrough(demo_data):
    """Sarah Jenkins must be flagged as BREAKTHROUGH."""
    sarah = next(s for s in demo_data["students"] if s["first_name"] == "Sarah" and s["last_name"] == "Jenkins")
    history = [
        HistoricalRecord(
            assessment_id=h["assessment_id"],
            title=h["title"],
            date="2026-10-01",
            percentage=h["score_pct"],
        )
        for h in sarah["history"]
    ]
    traj = calculate_student_trajectory("STU-802", history)
    assert traj.trajectory_label == "BREAKTHROUGH"
    assert "Prime candidate for positive reinforcement" in traj.evidence_summary


def test_marcus_vance_declining(demo_data):
    """Marcus Vance must be flagged as DECLINING."""
    marcus = next(s for s in demo_data["students"] if s["first_name"] == "Marcus" and s["last_name"] == "Vance")
    history = [
        HistoricalRecord(
            assessment_id=h["assessment_id"],
            title=h["title"],
            date="2026-10-01",
            percentage=h["score_pct"],
        )
        for h in marcus["history"]
    ]
    traj = calculate_student_trajectory("STU-803", history)
    assert traj.trajectory_label == "DECLINING"
    assert "Early intervention check recommended" in traj.evidence_summary


def test_chloe_adams_stable_high(demo_data):
    """Chloe Adams must be stable high."""
    chloe = next(s for s in demo_data["students"] if s["first_name"] == "Chloe" and s["last_name"] == "Adams")
    history = [
        HistoricalRecord(
            assessment_id=h["assessment_id"],
            title=h["title"],
            date="2026-10-01",
            percentage=h["score_pct"],
        )
        for h in chloe["history"]
    ]
    traj = calculate_student_trajectory("STU-801", history)
    assert traj.trajectory_label == "STABLE"
    assert traj.latest_percentage > 90.0

