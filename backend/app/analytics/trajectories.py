"""
Longitudinal Student Performance and Trajectory Analysis.

Tracks student percentage scores across time, computes rolling baselines,
trend momentum (slope and delta), and enforces minimum-data thresholds
before assigning pedagogical trajectory labels.

CRITICAL POLICY:
- Minimum of 3 historical assessments required before assigning a trajectory label.
- A single score drop must NEVER be labeled as a learning difficulty or cognitive deficit.
- All findings report sample size and historical baseline comparison.
"""

from dataclasses import dataclass
from datetime import date
from typing import List, Optional, Sequence
import numpy as np


@dataclass(frozen=True)
class HistoricalRecord:
    assessment_id: str
    title: str
    date: str
    percentage: float
    cohort_average: Optional[float] = None


@dataclass(frozen=True)
class TrajectoryResult:
    student_id: str
    num_assessments: int
    historical_average: float
    latest_percentage: float
    score_delta: float  # Latest - Previous
    linear_slope: Optional[float]
    trajectory_label: str  # 'IMPROVING', 'DECLINING', 'STABLE', 'BREAKTHROUGH', 'INSUFFICIENT_DATA'
    confidence: str  # 'HIGH', 'MODERATE', 'LOW'
    evidence_summary: str
    limitation_note: Optional[str] = None


def calculate_student_trajectory(
    student_id: str,
    history: Sequence[HistoricalRecord],
    min_assessments_required: int = 3,
    breakthrough_threshold: float = 20.0,
    decline_threshold: float = -15.0,
    improvement_threshold: float = 12.0,
) -> TrajectoryResult:
    """
    Compute longitudinal student trajectory from chronological assessment history.

    Args:
        student_id: Student identifier.
        history: Chronologically sorted assessment records (oldest to newest).
        min_assessments_required: Minimum observations before assigning a trend.
        breakthrough_threshold: Percentage leap defining a breakthrough moment.
        decline_threshold: Percentage drop defining a decline flag.
        improvement_threshold: Percentage gain defining an improving trend.

    Returns:
        TrajectoryResult with evidence-grounded summary.
    """
    n = len(history)
    if n == 0:
        return TrajectoryResult(
            student_id=student_id,
            num_assessments=0,
            historical_average=0.0,
            latest_percentage=0.0,
            score_delta=0.0,
            linear_slope=None,
            trajectory_label="INSUFFICIENT_DATA",
            confidence="LOW",
            evidence_summary="No assessment history available.",
            limitation_note="Requires data to evaluate performance.",
        )

    scores = [h.percentage for h in history]
    latest = scores[-1]
    hist_avg = round(float(np.mean(scores)), 2)

    if n < min_assessments_required:
        prev_score = scores[-2] if n > 1 else latest
        delta = round(latest - prev_score, 2)
        return TrajectoryResult(
            student_id=student_id,
            num_assessments=n,
            historical_average=hist_avg,
            latest_percentage=latest,
            score_delta=delta,
            linear_slope=None,
            trajectory_label="INSUFFICIENT_DATA",
            confidence="LOW",
            evidence_summary=(
                f"Student has completed {n} assessment(s) (latest: {latest}%). "
                f"Minimum of {min_assessments_required} assessments required before assigning a trajectory."
            ),
            limitation_note="Single assessments do not indicate an established trend or learning difficulty.",
        )

    # We have >= min_assessments_required (>= 3)
    x = np.arange(n, dtype=np.float64)
    y = np.array(scores, dtype=np.float64)
    # Fit linear slope: y = mx + c
    slope = round(float(np.polyfit(x, y, 1)[0]), 2)

    baseline_avg = round(float(np.mean(scores[:-1])), 2)
    delta_vs_baseline = round(latest - baseline_avg, 2)
    delta_vs_previous = round(latest - scores[-2], 2)

    # Classification logic grounded strictly in data
    label = "STABLE"
    confidence = "HIGH" if n >= 4 else "MODERATE"

    # Check for Breakthrough: Prior assessments had low average (< 65%), and latest jumped by >= breakthrough_threshold
    if baseline_avg < 65.0 and delta_vs_baseline >= breakthrough_threshold and latest >= 75.0:
        label = "BREAKTHROUGH"
        evidence = (
            f"Significant breakthrough detected: Student scored {latest}%, an increase of +{delta_vs_baseline}% "
            f"over their prior {n-1}-test baseline ({baseline_avg}%). Prime candidate for positive reinforcement."
        )
    elif slope >= 5.0 or (delta_vs_baseline >= improvement_threshold and latest > baseline_avg):
        label = "IMPROVING"
        evidence = (
            f"Consistent upward trajectory across {n} assessments: Average score rose to {latest}% "
            f"(baseline: {baseline_avg}%, slope: +{slope} pts/test)."
        )
    elif delta_vs_baseline <= decline_threshold or slope <= -5.0:
        label = "DECLINING"
        evidence = (
            f"Recent downward deviation: Student scored {latest}%, dropping {abs(delta_vs_baseline)}% below "
            f"their established {n-1}-assessment baseline ({baseline_avg}%). Early intervention check recommended."
        )
    else:
        label = "STABLE"
        evidence = (
            f"Stable academic performance across {n} assessments: Historical average of {hist_avg}% "
            f"(latest: {latest}%, slope: {slope:+.2f})."
        )

    limitation = (
        "Calculated from available classroom assessments. Performance fluctuations may reflect "
        "test-specific difficulty or curriculum topic variation rather than generalized aptitude."
    )

    return TrajectoryResult(
        student_id=student_id,
        num_assessments=n,
        historical_average=hist_avg,
        latest_percentage=latest,
        score_delta=delta_vs_previous,
        linear_slope=slope,
        trajectory_label=label,
        confidence=confidence,
        evidence_summary=evidence,
        limitation_note=limitation,
    )

