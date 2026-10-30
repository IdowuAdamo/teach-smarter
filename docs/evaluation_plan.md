# TeachSmarter: Testing and Evaluation Plan

## 1. Analytics & Psychometric Engine Verification

The deterministic Python engine (`backend/app/analytics/`) must be verified through automated regression tests against established psychometric benchmark values.

### Test Matrix
- **Difficulty ($p$-value)**:
  - Extreme values: $p = 1.0$ (all correct), $p = 0.0$ (all incorrect).
  - Normal distribution checks with varying sample sizes ($N = 10, 25, 100$).
- **Discrimination ($D$-value)**:
  - Kelley's upper 27% / lower 27% partition logic.
  - Negative discrimination cases ($D < 0.00$) correctly triggered.
  - Boundary conditions: $N < 10$ flagged with sample size warnings.
- **Point-Biserial Correlation ($r_{pbis}$)**:
  - Zero-variance handling (when all examinees get item right or wrong).
  - Missing student submissions and NaN handling.
- **Distractor Proportions**:
  - Verification that option proportions sum to $1.00$.
  - Detection of popular incorrect distractors in upper ability groups.

---

## 2. Agent Output Quality & Faithfulness

- **Groundedness**: Ensure all diagnostic statements cite exact assessment percentages, question numbers, or topic tags present in the underlying data.
- **Anti-Hallucination Checks**: Zero unsupported claims regarding medical, cognitive, or external family causes.
- **Pedagogical Alignment**: Recommendations must target the specific sub-topic identified as a gap.

---

## 3. Security, Authorization & Privacy Testing

- **Tenant Isolation**: Automated tests verifying that User A (Org 1) cannot read or write records belonging to Org 2.
- **HITL Safeguard Testing**:
  - Test attempting to dispatch an unapproved draft $\to$ Expect `403 Forbidden`.
  - Test modifying body after approval without re-approval $\to$ Expect `409 Conflict / Approval Invalidated`.
- **PII Scrubbing**: Verify that requests to LLMs contain zero occurrences of raw student names or email addresses.

