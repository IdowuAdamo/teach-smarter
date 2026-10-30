"""
Local PII De-Identification and Pseudonymization Boundary.

Ensures that:
1. Real student names, emails, phone numbers, and guardian details NEVER leave the backend boundary to external LLMs.
2. Models only see pseudonymous tokens: `Student_XXXX`.
3. Injected mapping allows re-hydrating drafts before presentation to teachers.
"""

from typing import Dict, List, Tuple
from pydantic import BaseModel


class MaskedStudentRecord(BaseModel):
    pseudonym_token: str
    historical_average: float
    latest_percentage: float
    score_delta: float
    trajectory_label: str
    topic_scores: Dict[str, float]  # e.g. {"Linear Equations": 0.88, "Exponents": 0.50}


class PrivacyVault:
    @staticmethod
    def mask_student_cohort(
        students_raw: List[Dict[str, any]],
    ) -> Tuple[List[MaskedStudentRecord], Dict[str, Dict[str, str]]]:
        """
        Strips PII and maps each student to a pseudonymous record.

        Returns:
            masked_records: Payload safe for external LLMs.
            vault_map: Local lookup map: { pseudonym_token -> { real_name, email, etc. } }
        """
        masked: List[MaskedStudentRecord] = []
        vault_map: Dict[str, Dict[str, str]] = {}

        for s in students_raw:
            token = s["pseudonym_token"]
            vault_map[token] = {
                "first_name": s["first_name"],
                "last_name": s["last_name"],
                "student_number": s["student_number"],
                "guardian_name": s.get("guardian_name", ""),
                "guardian_email": s.get("guardian_email", ""),
                "preferred_language": s.get("preferred_language", "en"),
            }

            masked.append(
                MaskedStudentRecord(
                    pseudonym_token=token,
                    historical_average=float(s.get("historical_average", 0.0)),
                    latest_percentage=float(s.get("latest_percentage", 0.0)),
                    score_delta=float(s.get("score_delta", 0.0)),
                    trajectory_label=s.get("trajectory_label", "STABLE"),
                    topic_scores=s.get("topic_scores", {}),
                )
            )

        return masked, vault_map

    @staticmethod
    def rehydrate_text(text: str, vault_map: Dict[str, Dict[str, str]]) -> str:
        """Restores real names into teacher-facing text using the local vault map."""
        rehydrated = text
        for token, pii in vault_map.items():
            if token in rehydrated:
                full_name = f"{pii['first_name']} {pii['last_name']}".strip()
                rehydrated = rehydrated.replace(token, full_name)
        return rehydrated

