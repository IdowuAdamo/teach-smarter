"""
Comprehensive Unit Tests for Deterministic Analytics Engine.

Verifies:
- Item Difficulty (p-value)
- Item Discrimination (Kelley's 27% D-value)
- Point-Biserial Correlation (r_pbis and corrected r)
- Distractor Option Analysis and Miskey Detection
- Student Longitudinal Trajectories & Minimum Sample Safeguards
- Class Performance & Topic Learning Gaps
"""

import pytest
from app.analytics.difficulty import calculate_item_difficulty
from app.analytics.discrimination import calculate_item_discrimination
from app.analytics.correlation import calculate_point_biserial
from app.analytics.distractors import analyze_distractors
from app.analytics.trajectories import calculate_student_trajectory, HistoricalRecord
from app.analytics.class_summary import calculate_class_summary


class TestItemDifficulty:
    def test_all_correct(self):
        res = calculate_item_difficulty("Q1", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        assert res.p_value == 1.0
        assert res.difficulty_label == "VERY_EASY"
        assert res.correct_responses == 10
        assert res.total_responses == 10

    def test_all_incorrect(self):
        res = calculate_item_difficulty("Q2", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        assert res.p_value == 0.0
        assert res.difficulty_label == "VERY_HARD"

    def test_optimal_range(self):
        # 6 correct out of 10 -> p = 0.60
        res = calculate_item_difficulty("Q3", [1, 1, 1, 1, 1, 1, 0, 0, 0, 0])
        assert res.p_value == 0.60
        assert res.difficulty_label == "OPTIMAL"

    def test_small_sample_warning(self):
        res = calculate_item_difficulty("Q4", [1, 0, 1], min_sample_size=10)
        assert res.limitation_warning is not None
        assert "below recommended minimum threshold" in res.limitation_warning

    def test_empty_input(self):
        res = calculate_item_difficulty("Q5", [])
        assert res.total_responses == 0
        assert res.p_value == 0.0
        assert res.difficulty_label == "NO_DATA"


class TestItemDiscrimination:
    def test_high_positive_discrimination(self):
        # 20 students. Upper group (top 27% -> 6 students) all got 1. Lower group (bottom 6) all got 0.
        item_scores = [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
        total_scores = list(range(10, 30))  # strictly ascending total scores
        res = calculate_item_discrimination("Q1", item_scores, total_scores, min_sample_size=10)
        assert res.d_value > 0.60
        assert res.discrimination_label == "EXCELLENT"
        assert res.requires_investigation is False

    def test_negative_discrimination_miskey_detection(self):
        # 20 students. Top students missed it, bottom students guessed/got it right!
        # Top 6 students (highest total score) got 0. Bottom 6 got 1.
        item_scores = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        total_scores = list(range(10, 30))
        res = calculate_item_discrimination("Q_FLAWED", item_scores, total_scores, min_sample_size=10)
        assert res.d_value < 0.0
        assert res.discrimination_label == "CRITICAL_ANOMALY"
        assert res.requires_investigation is True
        assert "Investigate for an incorrect answer key" in res.plain_english_indicator

    def test_poor_discrimination(self):
        # Both top and bottom got same rate
        item_scores = [1] * 20
        total_scores = list(range(10, 30))
        res = calculate_item_discrimination("Q_FLAT", item_scores, total_scores, min_sample_size=10)
        assert res.d_value == 0.0
        assert res.discrimination_label == "POOR"

    def test_insufficient_sample_size(self):
        res = calculate_item_discrimination("Q_TINY", [1, 0], [10, 20])
        assert res.discrimination_label == "INSUFFICIENT_DATA"


class TestPointBiserial:
    def test_positive_correlation(self):
        # High score on item correlates with high total score
        item_scores = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]
        total_scores = [30, 32, 35, 40, 42, 45, 48, 50, 70, 75, 78, 80, 85, 90, 92, 95]
        res = calculate_point_biserial("Q1", item_scores, total_scores, min_sample_size=10)
        assert res.is_valid is True
        assert res.r_pbis is not None
        assert res.r_pbis > 0.70
        assert "Strong item discrimination" in res.interpretation

    def test_zero_variance_handling(self):
        # All correct
        item_scores = [1] * 10
        total_scores = list(range(50, 60))
        res = calculate_point_biserial("Q_CONST", item_scores, total_scores)
        assert res.is_valid is False
        assert res.r_pbis == 0.0
        assert "Zero variance in item score" in res.limitation_warning


class TestDistractorAnalysis:
    def test_suspected_miskey_detection(self):
        # Option B is designated answer, but top students all selected C!
        # 10 students: 5 lower, 5 upper
        total_scores = [40, 45, 50, 52, 55, 80, 85, 90, 92, 95]
        # Low students picked B and A; High students picked C!
        selected_options = ["A", "B", "B", "D", "B", "C", "C", "C", "C", "B"]
        res = analyze_distractors(
            item_id="Q7_MISKEY",
            selected_options=selected_options,
            total_test_scores=total_scores,
            correct_option="B",
        )
        assert res.miskey_suspected is True
        assert "C" in res.anomalous_options
        assert "Potential Answer Key Error" in res.plain_english_summary

    def test_non_functioning_distractor(self):
        # Nobody selected Option D
        total_scores = list(range(50, 70))
        selected_options = ["A"] * 10 + ["B"] * 10
        res = analyze_distractors(
            item_id="Q_DIST",
            selected_options=selected_options,
            total_test_scores=total_scores,
            correct_option="A",
            available_options=["A", "B", "C", "D"],
        )
        assert "C" in res.non_functioning_options
        assert "D" in res.non_functioning_options


class TestStudentTrajectory:
    def test_insufficient_data_rule(self):
        # Only 2 assessments: Must NOT assign a trend label
        h = [
            HistoricalRecord("T1", "Unit 1", "2026-09-10", 60.0),
            HistoricalRecord("T2", "Unit 2", "2026-09-24", 50.0),
        ]
        res = calculate_student_trajectory("STUDENT_1", h, min_assessments_required=3)
        assert res.trajectory_label == "INSUFFICIENT_DATA"
        assert "Minimum of 3 assessments required" in res.evidence_summary

    def test_breakthrough_student(self):
        # Sarah Jenkins: 54%, 58%, 61% -> 89%
        h = [
            HistoricalRecord("T1", "Unit 1", "2026-09-10", 54.0),
            HistoricalRecord("T2", "Unit 2", "2026-09-24", 58.0),
            HistoricalRecord("T3", "Unit 3", "2026-10-08", 61.0),
            HistoricalRecord("T4", "Unit 4", "2026-10-22", 89.0),
        ]
        res = calculate_student_trajectory("SARAH_JENKINS", h)
        assert res.trajectory_label == "BREAKTHROUGH"
        assert "Prime candidate for positive reinforcement" in res.evidence_summary

    def test_declining_student(self):
        # Marcus Vance: 88%, 91%, 86% -> 61%
        h = [
            HistoricalRecord("T1", "Unit 1", "2026-09-10", 88.0),
            HistoricalRecord("T2", "Unit 2", "2026-09-24", 91.0),
            HistoricalRecord("T3", "Unit 3", "2026-10-08", 86.0),
            HistoricalRecord("T4", "Unit 4", "2026-10-22", 61.0),
        ]
        res = calculate_student_trajectory("MARCUS_VANCE", h)
        assert res.trajectory_label == "DECLINING"
        assert "Early intervention check recommended" in res.evidence_summary


class TestClassSummaryAndGaps:
    def test_class_summary_metrics(self):
        scores = [50.0, 60.0, 70.0, 80.0, 90.0]
        res = calculate_class_summary("ASSESS_1", scores)
        assert res.total_examinees == 5
        assert res.mean_percentage == 70.0
        assert res.median_percentage == 70.0
        assert res.min_percentage == 50.0
        assert res.max_percentage == 90.0

    def test_topic_learning_gap_detection(self):
        scores = [70.0] * 10
        item_responses = [
            # Topic: Linear Equations (High accuracy)
            {"topic_tag": "Linear Equations", "item_number": 1, "is_correct": True},
            {"topic_tag": "Linear Equations", "item_number": 1, "is_correct": True},
            {"topic_tag": "Linear Equations", "item_number": 1, "is_correct": True},
            {"topic_tag": "Linear Equations", "item_number": 1, "is_correct": True},
            # Topic: Negative Exponents (Low accuracy -> < 65%)
            {"topic_tag": "Negative Exponents", "item_number": 2, "is_correct": False},
            {"topic_tag": "Negative Exponents", "item_number": 2, "is_correct": False},
            {"topic_tag": "Negative Exponents", "item_number": 2, "is_correct": False},
            {"topic_tag": "Negative Exponents", "item_number": 2, "is_correct": True},
        ]
        res = calculate_class_summary("ASSESS_1", scores, item_responses=item_responses)
        assert "Negative Exponents" in res.systemic_gaps
        assert "Linear Equations" not in res.systemic_gaps

