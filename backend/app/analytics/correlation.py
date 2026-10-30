"""
Item-Total Point-Biserial Correlation (r_pbis) Calculation.

In Classical Item Analysis, the point-biserial correlation measures the correlation
between examinees' performance on an individual dichotomous question (1 or 0)
and their total score on the assessment.

Mathematically, it is identical to Pearson's r between item score X and total score Y:
    r_pbis = [ (Mean(Y_correct) - Mean(Y_total)) / SD(Y_total) ] * sqrt(p / (1 - p))

We also calculate the corrected (item-rest) point-biserial correlation:
    Y_rest = Y - X
which removes the item's own contribution from the total score to prevent inflation on short tests.
"""

from dataclasses import dataclass
from typing import Optional, Sequence, Tuple
import math
import numpy as np


@dataclass(frozen=True)
class PointBiserialResult:
    item_id: str
    sample_size: int
    r_pbis: Optional[float]
    r_corrected: Optional[float]
    is_valid: bool
    interpretation: str
    limitation_warning: Optional[str] = None


def calculate_point_biserial(
    item_id: str,
    item_scores: Sequence[int | bool | float],
    total_test_scores: Sequence[float | int],
    min_sample_size: int = 15,
) -> PointBiserialResult:
    """
    Compute raw and corrected item-total point-biserial correlation.

    Args:
        item_id: Question identifier.
        item_scores: Binary scores (1=correct, 0=incorrect).
        total_test_scores: Total test scores for examinees.
        min_sample_size: Minimum sample size threshold.

    Returns:
        PointBiserialResult with correlation coefficients and validity status.
    """
    if len(item_scores) != len(total_test_scores):
        raise ValueError(
            f"Length mismatch: item_scores ({len(item_scores)}) != total_test_scores ({len(total_test_scores)})"
        )

    # Filter invalid/None records
    paired = [
        (1.0 if bool(x) else 0.0, float(y))
        for x, y in zip(item_scores, total_test_scores)
        if x is not None and y is not None
    ]

    n = len(paired)
    if n < 4:
        return PointBiserialResult(
            item_id=item_id,
            sample_size=n,
            r_pbis=None,
            r_corrected=None,
            is_valid=False,
            interpretation="Insufficient data (N < 4).",
            limitation_warning="Sample size too small for statistical correlation.",
        )

    x_arr = np.array([p[0] for p in paired], dtype=np.float64)
    y_arr = np.array([p[1] for p in paired], dtype=np.float64)

    # Check for zero variance in item (all correct or all wrong)
    var_x = np.var(x_arr, ddof=1)
    var_y = np.var(y_arr, ddof=1)

    if var_x == 0.0:
        p_val = float(np.mean(x_arr))
        state = "everyone answered correctly" if p_val == 1.0 else "nobody answered correctly"
        return PointBiserialResult(
            item_id=item_id,
            sample_size=n,
            r_pbis=0.0,
            r_corrected=0.0,
            is_valid=False,
            interpretation=f"Constant item score ({state}). Correlation undefined; reported as 0.0.",
            limitation_warning="Zero variance in item score prevents correlation calculation.",
        )

    if var_y == 0.0:
        return PointBiserialResult(
            item_id=item_id,
            sample_size=n,
            r_pbis=0.0,
            r_corrected=0.0,
            is_valid=False,
            interpretation="All examinees achieved the exact same total score. Correlation undefined.",
            limitation_warning="Zero variance in total test scores.",
        )

    # Standard Pearson correlation between item X and total score Y
    sd_x = np.std(x_arr, ddof=1)
    sd_y = np.std(y_arr, ddof=1)
    cov_xy = np.cov(x_arr, y_arr, ddof=1)[0, 1]
    r_pbis = round(float(cov_xy / (sd_x * sd_y)), 4)

    # Corrected point-biserial (item-rest correlation: Y_rest = Y - X)
    y_rest = y_arr - x_arr
    var_y_rest = np.var(y_rest, ddof=1)
    if var_y_rest == 0.0:
        r_corrected = 0.0
    else:
        sd_y_rest = np.std(y_rest, ddof=1)
        cov_x_yrest = np.cov(x_arr, y_rest, ddof=1)[0, 1]
        r_corrected = round(float(cov_x_yrest / (sd_x * sd_y_rest)), 4)

    # Interpretation
    warning = None
    if n < min_sample_size:
        warning = f"Sample size (N={n}) is below recommended minimum threshold (N={min_sample_size})."

    if r_pbis >= 0.40:
        interp = f"Strong item discrimination (r = {r_pbis:.2f}). Highly reliable predictor of overall test performance."
    elif r_pbis >= 0.25:
        interp = f"Moderate item discrimination (r = {r_pbis:.2f}). Positively aligned with test construct."
    elif r_pbis >= 0.15:
        interp = f"Weak item discrimination (r = {r_pbis:.2f}). Marginal relationship to total score."
    elif r_pbis >= 0.0:
        interp = f"Negligible correlation (r = {r_pbis:.2f}). Item does not differentiate student mastery."
    else:
        interp = (
            f"Negative correlation (r = {r_pbis:.2f}). Examinees who performed well overall scored poorly on this item. "
            f"Investigate for answer key flaws or trick phrasing."
        )

    return PointBiserialResult(
        item_id=item_id,
        sample_size=n,
        r_pbis=r_pbis,
        r_corrected=r_corrected,
        is_valid=True,
        interpretation=interp,
        limitation_warning=warning,
    )

