"""
Item Discrimination Index (D-value) Calculation using Kelley's 27% Rule.

Formula:
    D = p_U - p_L
where:
    p_U = proportion of correct responses in the upper 27% performance group
    p_L = proportion of correct responses in the lower 27% performance group

Interpretation Guidelines (Configurable indicators):
    D >= 0.40: EXCELLENT discrimination.
    0.30 <= D < 0.40: GOOD discrimination.
    0.20 <= D < 0.30: ACCEPTABLE / MARGINAL discrimination.
    0.00 <= D < 0.20: POOR discrimination (review recommended).
    D < 0.00: CRITICAL ANOMALY (investigate for answer key error, ambiguous wording, or flawed distractors).
"""

from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple
import math


@dataclass(frozen=True)
class ItemDiscriminationResult:
    item_id: str
    total_examinees: int
    group_size: int
    p_upper: float
    p_lower: float
    d_value: float
    discrimination_label: str  # 'EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR', 'CRITICAL_ANOMALY', 'INSUFFICIENT_DATA'
    requires_investigation: bool
    plain_english_indicator: str
    limitation_warning: Optional[str] = None


def calculate_item_discrimination(
    item_id: str,
    item_scores: Sequence[int | bool | float],
    total_test_scores: Sequence[float | int],
    kelley_fraction: float = 0.27,
    min_sample_size: int = 15,
) -> ItemDiscriminationResult:
    """
    Calculate Kelley's 27% Item Discrimination Index D = p_U - p_L.

    Args:
        item_id: Question/Item ID.
        item_scores: Binary scores (1=correct, 0=incorrect) for each examinee on this question.
        total_test_scores: Overall test scores for each examinee (used for sorting performance).
        kelley_fraction: Fraction used for top/bottom groups (default 0.27).
        min_sample_size: Sample size under which statistical power warning is generated.

    Returns:
        ItemDiscriminationResult with D-value, classification, and investigation flags.
    """
    if len(item_scores) != len(total_test_scores):
        raise ValueError(
            f"Length mismatch: item_scores ({len(item_scores)}) != total_test_scores ({len(total_test_scores)})"
        )

    # Filter out missing records
    paired: List[Tuple[float, int]] = []
    for item_val, total_val in zip(item_scores, total_test_scores):
        if item_val is not None and total_val is not None:
            paired.append((float(total_val), 1 if bool(item_val) else 0))

    n = len(paired)
    if n < 4:
        return ItemDiscriminationResult(
            item_id=item_id,
            total_examinees=n,
            group_size=0,
            p_upper=0.0,
            p_lower=0.0,
            d_value=0.0,
            discrimination_label="INSUFFICIENT_DATA",
            requires_investigation=False,
            plain_english_indicator="Fewer than 4 responses. Discrimination cannot be calculated.",
            limitation_warning="Sample size is too small for Kelley's 27% group comparison.",
        )

    # Sort examinees ascending by total test score
    paired.sort(key=lambda x: x[0])

    # Determine Kelley group size (at least 1 examinee per group)
    group_size = max(1, int(math.ceil(n * kelley_fraction)))
    if group_size * 2 > n:
        group_size = max(1, n // 2)

    lower_group = paired[:group_size]
    upper_group = paired[-group_size:]

    r_upper = sum(item for _, item in upper_group)
    r_lower = sum(item for _, item in lower_group)

    p_upper = round(r_upper / group_size, 4)
    p_lower = round(r_lower / group_size, 4)
    d_value = round(p_upper - p_lower, 4)

    # Classification
    warning = None
    if n < min_sample_size:
        warning = f"Sample size (N={n}) is below recommended threshold ({min_sample_size}). Group size={group_size}. Treat D-value as an indicative signal."

    requires_investigation = False
    if d_value < 0.0:
        label = "CRITICAL_ANOMALY"
        requires_investigation = True
        explanation = (
            f"Negative discrimination (D = {d_value:.2f}): Top-performing students missed this question "
            f"more often than lower-performing students (Upper: {int(p_upper*100)}%, Lower: {int(p_lower*100)}%). "
            f"Investigate for an incorrect answer key or ambiguous wording."
        )
    elif d_value < 0.20:
        label = "POOR"
        requires_investigation = (d_value == 0.0 and p_upper < 0.5)
        explanation = (
            f"Poor discrimination (D = {d_value:.2f}): Does not effectively differentiate higher from lower achievers."
        )
    elif d_value < 0.30:
        label = "ACCEPTABLE"
        explanation = f"Acceptable discrimination (D = {d_value:.2f})."
    elif d_value < 0.40:
        label = "GOOD"
        explanation = f"Good discrimination (D = {d_value:.2f}): Effectively differentiates between student ability levels."
    else:
        label = "EXCELLENT"
        explanation = f"Excellent discrimination (D = {d_value:.2f}): Strong positive alignment with overall performance."

    return ItemDiscriminationResult(
        item_id=item_id,
        total_examinees=n,
        group_size=group_size,
        p_upper=p_upper,
        p_lower=p_lower,
        d_value=d_value,
        discrimination_label=label,
        requires_investigation=requires_investigation,
        plain_english_indicator=explanation,
        limitation_warning=warning,
    )

