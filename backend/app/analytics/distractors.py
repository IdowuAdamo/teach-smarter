"""
Distractor Frequency and Performance Group Analysis.

Analyzes multiple-choice option selections across the overall cohort and across
ability groups (Upper 27%, Middle 46%, Lower 27%).

Flags:
- Plausible / Functioning distractors
- Non-functioning distractors (< 5% selection)
- Suspected miskey: An incorrect option selected more frequently by the upper group than the designated correct key.
- Ambiguous options: Substantial clustering on a single distractor.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple
import math


@dataclass(frozen=True)
class OptionGroupBreakdown:
    option: str
    overall_count: int
    overall_pct: float
    upper_count: int
    upper_pct: float
    lower_count: int
    lower_pct: float
    is_correct_key: bool


@dataclass(frozen=True)
class DistractorAnalysisResult:
    item_id: str
    correct_option: str
    total_responses: int
    group_size: int
    option_breakdown: List[OptionGroupBreakdown]
    non_functioning_options: List[str]  # Selected by < 5% of examinees
    anomalous_options: List[str]        # Non-keyed options popular in upper group
    miskey_suspected: bool
    plain_english_summary: str
    limitation_warning: Optional[str] = None


def analyze_distractors(
    item_id: str,
    selected_options: Sequence[str],
    total_test_scores: Sequence[float | int],
    correct_option: str,
    available_options: Sequence[str] = ("A", "B", "C", "D"),
    kelley_fraction: float = 0.27,
) -> DistractorAnalysisResult:
    """
    Perform distractor analysis on multiple-choice responses.

    Args:
        item_id: Question ID.
        selected_options: List of student choices (e.g., 'A', 'B', 'C', 'D').
        total_test_scores: Total scores of students on the assessment.
        correct_option: The designated answer key (e.g., 'B').
        available_options: All candidate choices.
        kelley_fraction: Fraction for upper/lower group sizing.

    Returns:
        DistractorAnalysisResult with option distributions and flags.
    """
    if len(selected_options) != len(total_test_scores):
        raise ValueError("Length mismatch between selected_options and total_test_scores")

    norm_correct = correct_option.strip().upper()
    paired: List[Tuple[float, str]] = []
    for opt, score in zip(selected_options, total_test_scores):
        if opt is not None and score is not None:
            paired.append((float(score), str(opt).strip().upper()))

    n = len(paired)
    if n == 0:
        return DistractorAnalysisResult(
            item_id=item_id,
            correct_option=norm_correct,
            total_responses=0,
            group_size=0,
            option_breakdown=[],
            non_functioning_options=[],
            anomalous_options=[],
            miskey_suspected=False,
            plain_english_summary="No response data available.",
            limitation_warning="Empty dataset.",
        )

    # Sort examinees ascending by total score
    paired.sort(key=lambda x: x[0])

    group_size = max(1, int(math.ceil(n * kelley_fraction)))
    if group_size * 2 > n:
        group_size = max(1, n // 2)

    lower_group = paired[:group_size]
    upper_group = paired[-group_size:]

    # Collect options to report
    all_seen_options = sorted(list(set(list(available_options) + [p[1] for p in paired])))

    breakdowns: List[OptionGroupBreakdown] = []
    non_functioning: List[str] = []
    anomalous: List[str] = []
    miskey_suspected = False

    upper_correct_count = sum(1 for _, opt in upper_group if opt == norm_correct)

    for opt in all_seen_options:
        is_key = (opt == norm_correct)
        overall_c = sum(1 for _, o in paired if o == opt)
        overall_p = round(overall_c / n, 4)

        upper_c = sum(1 for _, o in upper_group if o == opt)
        upper_p = round(upper_c / group_size, 4)

        lower_c = sum(1 for _, o in lower_group if o == opt)
        lower_p = round(lower_c / group_size, 4)

        breakdowns.append(
            OptionGroupBreakdown(
                option=opt,
                overall_count=overall_c,
                overall_pct=overall_p,
                upper_count=upper_c,
                upper_pct=upper_p,
                lower_count=lower_c,
                lower_pct=lower_p,
                is_correct_key=is_key,
            )
        )

        if not is_key:
            # Check non-functioning distractor (< 5% overall)
            if overall_p < 0.05:
                non_functioning.append(opt)

            # Check if this distractor was picked more often than the correct key by the upper group
            if upper_c > upper_correct_count:
                anomalous.append(opt)
                miskey_suspected = True

    # Build plain-English summary
    summary_parts = []
    if miskey_suspected:
        anom_opts = ", ".join(anomalous)
        summary_parts.append(
            f"Potential Answer Key Error: Option {anom_opts} was selected by more top-performing students "
            f"than the designated correct answer ({norm_correct})."
        )
    elif non_functioning:
        non_func_str = ", ".join(non_functioning)
        summary_parts.append(
            f"Non-functioning distractors ({non_func_str}): Selected by fewer than 5% of examinees; provides low diagnostic value."
        )
    else:
        summary_parts.append("Distractors functioned as expected across ability groups.")

    warning = None
    if n < 15:
        warning = f"Sample size (N={n}) is limited. Group comparisons (group_size={group_size}) should be interpreted cautiously."

    return DistractorAnalysisResult(
        item_id=item_id,
        correct_option=norm_correct,
        total_responses=n,
        group_size=group_size,
        option_breakdown=breakdowns,
        non_functioning_options=non_functioning,
        anomalous_options=anomalous,
        miskey_suspected=miskey_suspected,
        plain_english_summary=" ".join(summary_parts),
        limitation_warning=warning,
    )

