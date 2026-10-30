"""
Classroom Performance Summary and Topic-Level Gap Analysis.

Calculates:
- Cohort mean, median, standard deviation, and IQR percentiles (25th, 50th, 75th).
- Score distribution brackets (< 50%, 50-69%, 70-84%, 85-100%).
- Topic-level aggregate mastery (percentage correct per curriculum topic).
- Identified systemic classroom learning gaps (topics with < 65% aggregate accuracy).
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence
import numpy as np


@dataclass(frozen=True)
class TopicMastery:
    topic_tag: str
    total_questions: int
    total_attempts: int
    correct_attempts: int
    mastery_percentage: float
    is_learning_gap: bool  # Mastery < threshold (default 65%)


@dataclass(frozen=True)
class ClassSummaryResult:
    assessment_id: str
    total_examinees: int
    mean_percentage: float
    median_percentage: float
    std_deviation: float
    min_percentage: float
    max_percentage: float
    percentile_25: float
    percentile_75: float
    distribution_bins: Dict[str, int]  # e.g., {"0-49%": 2, "50-69%": 5, "70-84%": 12, "85-100%": 6}
    topic_mastery: List[TopicMastery]
    systemic_gaps: List[str]
    sample_size_note: Optional[str] = None


def calculate_class_summary(
    assessment_id: str,
    scores_percentages: Sequence[float],
    item_responses: Optional[Sequence[Dict[str, any]]] = None,
    gap_threshold_pct: float = 65.0,
) -> ClassSummaryResult:
    """
    Generate aggregate class-level statistics and topic mastery breakdown.

    Args:
        assessment_id: Assessment ID.
        scores_percentages: List of overall percentage scores achieved by examinees.
        item_responses: Optional list of dicts: {"topic_tag": str, "is_correct": bool}.
        gap_threshold_pct: Topic percentage below which a topic is flagged as a systemic learning gap.

    Returns:
        ClassSummaryResult with comprehensive distributional metrics and identified gaps.
    """
    valid_scores = [float(s) for s in scores_percentages if s is not None]
    n = len(valid_scores)

    if n == 0:
        return ClassSummaryResult(
            assessment_id=assessment_id,
            total_examinees=0,
            mean_percentage=0.0,
            median_percentage=0.0,
            std_deviation=0.0,
            min_percentage=0.0,
            max_percentage=0.0,
            percentile_25=0.0,
            percentile_75=0.0,
            distribution_bins={"0-49%": 0, "50-69%": 0, "70-84%": 0, "85-100%": 0},
            topic_mastery=[],
            systemic_gaps=[],
            sample_size_note="No score records provided.",
        )

    arr = np.array(valid_scores, dtype=np.float64)
    mean_val = round(float(np.mean(arr)), 2)
    median_val = round(float(np.median(arr)), 2)
    std_val = round(float(np.std(arr, ddof=1)) if n > 1 else 0.0, 2)
    min_val = round(float(np.min(arr)), 2)
    max_val = round(float(np.max(arr)), 2)
    p25 = round(float(np.percentile(arr, 25)), 2)
    p75 = round(float(np.percentile(arr, 75)), 2)

    # Score distribution brackets
    bins = {
        "0-49%": int(np.sum(arr < 50.0)),
        "50-69%": int(np.sum((arr >= 50.0) & (arr < 70.0))),
        "70-84%": int(np.sum((arr >= 70.0) & (arr < 85.0))),
        "85-100%": int(np.sum(arr >= 85.0)),
    }

    # Topic-level aggregation
    topic_results: List[TopicMastery] = []
    systemic_gaps: List[str] = []

    if item_responses:
        # Group by topic_tag
        topics: Dict[str, Dict[str, int]] = {}
        topic_q_set: Dict[str, set] = {}

        for resp in item_responses:
            t = str(resp.get("topic_tag", "General")).strip()
            item_num = resp.get("item_number", 0)
            is_corr = bool(resp.get("is_correct", False))

            if t not in topics:
                topics[t] = {"total": 0, "correct": 0}
                topic_q_set[t] = set()

            topics[t]["total"] += 1
            if is_corr:
                topics[t]["correct"] += 1
            topic_q_set[t].add(item_num)

        for t_name, data in sorted(topics.items()):
            tot = data["total"]
            corr = data["correct"]
            mastery = round((corr / tot) * 100.0, 2) if tot > 0 else 0.0
            is_gap = mastery < gap_threshold_pct

            if is_gap:
                systemic_gaps.append(t_name)

            topic_results.append(
                TopicMastery(
                    topic_tag=t_name,
                    total_questions=len(topic_q_set[t_name]),
                    total_attempts=tot,
                    correct_attempts=corr,
                    mastery_percentage=mastery,
                    is_learning_gap=is_gap,
                )
            )

    note = None
    if n < 15:
        note = f"Class cohort size is small (N={n}). Standard deviation and percentiles may fluctuate."

    return ClassSummaryResult(
        assessment_id=assessment_id,
        total_examinees=n,
        mean_percentage=mean_val,
        median_percentage=median_val,
        std_deviation=std_val,
        min_percentage=min_val,
        max_percentage=max_val,
        percentile_25=p25,
        percentile_75=p75,
        distribution_bins=bins,
        topic_mastery=topic_results,
        systemic_gaps=systemic_gaps,
        sample_size_note=note,
    )

