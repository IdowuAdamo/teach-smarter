"""
Deterministic Psychometrics and Classroom Analytics Engine.

Follows Classical Test Theory (CTT):
- Item Difficulty (p-value)
- Item Discrimination (Kelley's 27% D-value)
- Item-Total Point-Biserial Correlation (r_pbis)
- Distractor Frequency & Group Analysis
- Longitudinal Trajectory & Learning Gap Analysis
"""

from .difficulty import calculate_item_difficulty, ItemDifficultyResult
from .discrimination import calculate_item_discrimination, ItemDiscriminationResult
from .correlation import calculate_point_biserial, PointBiserialResult
from .distractors import analyze_distractors, DistractorAnalysisResult
from .trajectories import calculate_student_trajectory, TrajectoryResult
from .class_summary import calculate_class_summary, ClassSummaryResult

__all__ = [
    "calculate_item_difficulty",
    "ItemDifficultyResult",
    "calculate_item_discrimination",
    "ItemDiscriminationResult",
    "calculate_point_biserial",
    "PointBiserialResult",
    "analyze_distractors",
    "DistractorAnalysisResult",
    "calculate_student_trajectory",
    "TrajectoryResult",
    "calculate_class_summary",
    "ClassSummaryResult",
]

