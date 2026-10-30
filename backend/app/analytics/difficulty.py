"""
Item Difficulty Index (p-value) Calculation.

In Classical Test Theory, item difficulty p for dichotomously scored items is:
    p = R / N
where:
    R = number of correct responses
    N = number of valid responses

A value of 1.0 indicates that everyone answered correctly.
A value of 0.0 indicates that nobody answered correctly.
"""

from dataclasses import dataclass
from typing import List, Optional, Sequence


@dataclass(frozen=True)
class ItemDifficultyResult:
    item_id: str
    total_responses: int
    correct_responses: int
    p_value: float
    difficulty_label: str  # 'VERY_EASY', 'EASY', 'OPTIMAL', 'HARD', 'VERY_HARD'
    limitation_warning: Optional[str] = None


def calculate_item_difficulty(
    item_id: str,
    responses: Sequence[int | bool | float],
    min_sample_size: int = 10,
) -> ItemDifficultyResult:
    """
    Calculate the item difficulty (p-value) from a sequence of binary responses (1/True = correct, 0/False = incorrect).

    Args:
        item_id: Identifier of the question/item.
        responses: Sequence of 1s/0s or True/False representing correctness. None/NaN should be filtered beforehand.
        min_sample_size: Minimum number of examinees required for statistical reliability.

    Returns:
        ItemDifficultyResult containing p-value and pedagogical interpretation label.
    """
    valid_responses = [1 if bool(r) else 0 for r in responses if r is not None]
    n = len(valid_responses)

    if n == 0:
        return ItemDifficultyResult(
            item_id=item_id,
            total_responses=0,
            correct_responses=0,
            p_value=0.0,
            difficulty_label="NO_DATA",
            limitation_warning="No valid responses provided for this item.",
        )

    correct_count = sum(valid_responses)
    p_value = round(correct_count / n, 4)

    # Configurable pedagogical benchmarks
    if p_value >= 0.90:
        label = "VERY_EASY"
    elif p_value >= 0.75:
        label = "EASY"
    elif p_value >= 0.35:
        label = "OPTIMAL"
    elif p_value >= 0.20:
        label = "HARD"
    else:
        label = "VERY_HARD"

    warning = None
    if n < min_sample_size:
        warning = f"Sample size (N={n}) is below recommended minimum threshold (N={min_sample_size}). Interpret with caution."

    return ItemDifficultyResult(
        item_id=item_id,
        total_responses=n,
        correct_responses=correct_count,
        p_value=p_value,
        difficulty_label=label,
        limitation_warning=warning,
    )

