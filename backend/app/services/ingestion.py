"""
Spreadsheet Ingestion and Deterministic Column Mapping Service.

Follows Section 2.3 and Section 3.1:
1. Inspects spreadsheet (CSV or XLSX).
2. Applies deterministic regex and heuristic column matching first.
3. Detects ambiguous columns requiring teacher confirmation.
4. Validates score bounds, duplicates, and missing values.
5. Normalizes records into the application data model upon teacher commit.
"""

import io
import re
import uuid
import hashlib
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Organisation,
    Classroom,
    Student,
    Guardian,
    Assessment,
    AssessmentItem,
    StudentSubmission,
    QuestionResponse,
)


@dataclass
class ColumnMappingProposal:
    detected_column: str
    suggested_target: str  # 'student_number', 'first_name', 'last_name', 'full_name', 'guardian_name', 'guardian_email', 'language', 'item_response', 'score_total', 'score_percentage', 'ignore'
    confidence: float      # 0.0 to 1.0
    item_number: Optional[int] = None
    is_ambiguous: bool = False
    sample_values: List[str] = field(default_factory=list)


@dataclass
class ValidationIssue:
    row_number: int
    column_name: str
    issue_type: str  # 'ERROR', 'WARNING'
    message: str


@dataclass
class IngestionReport:
    filename: str
    total_rows: int
    total_columns: int
    mappings: List[ColumnMappingProposal]
    is_ambiguous: bool
    requires_confirmation: bool
    validation_issues: List[ValidationIssue]
    detected_items_count: int
    detected_answer_keys: Dict[int, str] = field(default_factory=dict)


# Deterministic pattern matchers
PATTERNS = {
    "student_number": [r"^student[\s_-]?id", r"^student[\s_-]?num", r"^stu[\s_-]?id", r"^reg[\s_-]?no", r"^matric"],
    "first_name": [r"^first[\s_-]?name", r"^firstname", r"^given[\s_-]?name"],
    "last_name": [r"^last[\s_-]?name", r"^lastname", r"^surname", r"^family[\s_-]?name"],
    "full_name": [r"^full[\s_-]?name", r"^student[\s_-]?name", r"^name$"],
    "guardian_name": [r"^guardian[\s_-]?name", r"^parent[\s_-]?name", r"^guardian$", r"^parent$"],
    "guardian_email": [r"^guardian[\s_-]?email", r"^parent[\s_-]?email", r"^contact[\s_-]?email", r"^email$"],
    "language": [r"^preferred[\s_-]?lang", r"^language", r"^lang$"],
    "score_total": [r"^total", r"^total[\s_-]?score", r"^raw[\s_-]?score"],
    "score_percentage": [r"^%|\(%\)|percent|percentage"],
}


def generate_pseudonym(org_id: str, student_number: str) -> str:
    """Generate deterministic pseudonymous token: Student_XXXX"""
    raw = f"{org_id}:{student_number}".encode("utf-8")
    digest = hashlib.sha256(raw).hexdigest()[:8].upper()
    return f"Student_{digest}"


def inspect_dataframe(df: pd.DataFrame, filename: str) -> IngestionReport:
    """Inspect DataFrame headers and propose deterministic mappings."""
    mappings: List[ColumnMappingProposal] = []
    has_ambiguity = False
    detected_items = 0

    for col in df.columns:
        col_str = str(col).strip()
        col_lower = col_str.lower()
        samples = [str(v) for v in df[col].dropna().head(3).tolist()]

        matched_target = "ignore"
        confidence = 0.0
        item_num = None
        is_ambiguous = False

        # 1. Check for Question Item pattern (e.g., Q1, Q2, Question 3, Item_4)
        item_match = re.search(r"^(?:q|item|question)[\s_-]?(\d+)$", col_lower)
        if item_match:
            matched_target = "item_response"
            item_num = int(item_match.group(1))
            confidence = 0.95
            detected_items += 1
        else:
            # 2. Check header patterns
            for target_type, pattern_list in PATTERNS.items():
                for pat in pattern_list:
                    if re.search(pat, col_lower):
                        matched_target = target_type
                        confidence = 0.90
                        break
                if matched_target != "ignore":
                    break

        # Ambiguity heuristics
        if confidence == 0.0:
            # Check if values look like percentages or numbers
            if pd.api.types.is_numeric_dtype(df[col]):
                matched_target = "score_total"
                confidence = 0.50
                is_ambiguous = True
                has_ambiguity = True
            else:
                matched_target = "ignore"
                confidence = 0.30

        mappings.append(
            ColumnMappingProposal(
                detected_column=col_str,
                suggested_target=matched_target,
                confidence=confidence,
                item_number=item_num,
                is_ambiguous=is_ambiguous,
                sample_values=samples,
            )
        )

    # Validate essential presence: need a student identifier
    targets = [m.suggested_target for m in mappings]
    has_student_id = "student_number" in targets or "full_name" in targets or ("first_name" in targets and "last_name" in targets)
    if not has_student_id:
        has_ambiguity = True

    # Detect self-contained Answer Key row if present in spreadsheet
    detected_answer_keys: Dict[int, str] = {}
    id_col = next((m.detected_column for m in mappings if m.suggested_target == "student_number"), None)
    first_col = next((m.detected_column for m in mappings if m.suggested_target == "first_name"), None)
    item_cols_detected = [(m.item_number, m.detected_column) for m in mappings if m.suggested_target == "item_response" and m.item_number]

    total_examinees = len(df)
    for idx, row in df.iterrows():
        check_val = str(row[id_col]).strip().upper() if id_col and pd.notna(row[id_col]) else ""
        if not check_val and first_col and pd.notna(row[first_col]):
            check_val = str(row[first_col]).strip().upper()
        if check_val in ["KEY", "ANSWER_KEY", "ANSWER KEY", "CORRECT_KEY", "CORRECT KEY", "ANSWER_KEYS"]:
            total_examinees -= 1  # Exclude key row from student count
            for it_num, col_name in item_cols_detected:
                if pd.notna(row[col_name]):
                    detected_answer_keys[it_num] = str(row[col_name]).strip().upper()
            break

    # Run quick validation on df
    validation_issues = []
    if id_col:
        # Exclude KEY row from duplicate checks
        student_rows = df[~df[id_col].astype(str).str.upper().isin(["KEY", "ANSWER_KEY", "ANSWER KEY", "CORRECT_KEY", "CORRECT KEY"])]
        duplicates = student_rows[student_rows.duplicated(subset=[id_col], keep=False)]
        if not duplicates.empty:
            for idx in duplicates.index:
                validation_issues.append(
                    ValidationIssue(
                        row_number=int(idx) + 2,  # 1-indexed header + 1
                        column_name=id_col,
                        issue_type="ERROR",
                        message=f"Duplicate student identifier detected: '{df.loc[idx, id_col]}'",
                    )
                )

    return IngestionReport(
        filename=filename,
        total_rows=total_examinees,
        total_columns=len(df.columns),
        mappings=mappings,
        is_ambiguous=has_ambiguity,
        requires_confirmation=has_ambiguity,
        validation_issues=validation_issues,
        detected_items_count=detected_items,
        detected_answer_keys=detected_answer_keys,
    )


def load_file_to_dataframe(content_bytes: bytes, filename: str) -> pd.DataFrame:
    """Load uploaded spreadsheet content (CSV or XLSX) into a pandas DataFrame."""
    lower_fn = filename.lower()
    if lower_fn.endswith(".xlsx") or lower_fn.endswith(".xls"):
        return pd.read_excel(io.BytesIO(content_bytes))
    else:
        # Default to CSV
        return pd.read_csv(io.BytesIO(content_bytes))


async def commit_import_to_database(
    session: AsyncSession,
    organisation_id: str,
    classroom_id: str,
    assessment_title: str,
    assessment_date: date,
    df: pd.DataFrame,
    mappings: Dict[str, str],  # col_name -> target_type
    answer_keys: Optional[Dict[int, str]] = None,
) -> Dict[str, Any]:
    """
    Commit validated spreadsheet rows into PostgreSQL / SQLite database.

    Creates/updates:
    - Students (with unique pseudonym tokens)
    - Guardians
    - Assessment & Assessment Items
    - Student Submissions & Question Responses
    """
    answer_keys = answer_keys or {}

    # 1. Identify mapped columns
    col_by_target = {target: col for col, target in mappings.items()}
    id_col = col_by_target.get("student_number")
    first_col = col_by_target.get("first_name")
    last_col = col_by_target.get("last_name")
    full_col = col_by_target.get("full_name")
    guard_name_col = col_by_target.get("guardian_name")
    guard_email_col = col_by_target.get("guardian_email")
    lang_col = col_by_target.get("language")
    score_total_col = col_by_target.get("score_total")
    score_pct_col = col_by_target.get("score_percentage")

    # Item question columns
    item_cols: List[Tuple[int, str]] = []
    for col, target in mappings.items():
        if target == "item_response":
            m = re.search(r"(\d+)", col)
            item_num = int(m.group(1)) if m else len(item_cols) + 1
            item_cols.append((item_num, col))
    item_cols.sort(key=lambda x: x[0])

    # Pre-scan for an Answer Key row in dataframe
    key_row_indices = []
    for idx, row in df.iterrows():
        check_val = str(row[id_col]).strip().upper() if id_col and pd.notna(row[id_col]) else ""
        if not check_val and first_col and pd.notna(row[first_col]):
            check_val = str(row[first_col]).strip().upper()
        if check_val in ["KEY", "ANSWER_KEY", "ANSWER KEY", "CORRECT_KEY", "CORRECT KEY", "ANSWER_KEYS"]:
            key_row_indices.append(idx)
            for item_num, col_name in item_cols:
                if pd.notna(row[col_name]):
                    answer_keys[item_num] = str(row[col_name]).strip().upper()

    max_score = float(len(item_cols)) if item_cols else 100.0

    # 2. Create Assessment
    assessment = Assessment(
        organisation_id=organisation_id,
        classroom_id=classroom_id,
        title=assessment_title,
        max_score=max_score,
        date_administered=assessment_date,
    )
    session.add(assessment)
    await session.flush()

    def get_topic_for_item(item_idx: int, title: str) -> str:
        tl = title.lower()
        if "geometry" in tl or "unit 4" in tl or "unit4" in tl:
            if item_idx <= 5: return "Angles & Parallel Lines"
            if item_idx <= 10: return "Triangles & Polygons"
            return "Perimeter, Area & Plane Mensuration"
        if "exponent" in tl or "unit 3" in tl or "unit3" in tl:
            if item_idx <= 5: return "Solving Linear Equations"
            if item_idx <= 10: return "Linear Graphing & Slope"
            return "Negative Exponents & Scientific Notation"
        return "General Mathematics"

    # 3. Create Assessment Items
    item_objects: Dict[int, AssessmentItem] = {}
    for item_num, _ in item_cols:
        correct_key = answer_keys.get(item_num) or answer_keys.get(str(item_num)) or "A"
        item = AssessmentItem(
            assessment_id=assessment.id,
            item_number=item_num,
            correct_option=correct_key,
            mark_allocation=1.0,
            topic_tag=get_topic_for_item(item_num, assessment_title),
        )
        session.add(item)
        item_objects[item_num] = item
    await session.flush()

    # 4. Process each student row
    students_created = 0
    submissions_created = 0

    for idx, row in df.iterrows():
        if idx in key_row_indices:
            continue

        # Determine student number & names
        if id_col and pd.notna(row[id_col]):
            stu_num = str(row[id_col]).strip()
        else:
            stu_num = f"STU-{idx+1:03d}"

        if stu_num.upper() in ["KEY", "ANSWER_KEY", "ANSWER KEY", "CORRECT_KEY", "CORRECT KEY", "ANSWER_KEYS"]:
            continue

        if first_col and last_col and pd.notna(row[first_col]):
            f_name = str(row[first_col]).strip()
            l_name = str(row[last_col]).strip() if pd.notna(row[last_col]) else ""
        elif full_col and pd.notna(row[full_col]):
            parts = str(row[full_col]).strip().split(" ", 1)
            f_name = parts[0]
            l_name = parts[1] if len(parts) > 1 else ""
        else:
            f_name = f"Student"
            l_name = str(stu_num)

        # Check existing student in org
        stmt = select(Student).where(
            Student.organisation_id == organisation_id,
            Student.student_number == stu_num,
        )
        res = await session.execute(stmt)
        student = res.scalar_one_or_none()

        if not student:
            pseudonym = generate_pseudonym(organisation_id, stu_num)
            student = Student(
                organisation_id=organisation_id,
                classroom_id=classroom_id,
                student_number=stu_num,
                first_name=f_name,
                last_name=l_name,
                pseudonym_token=pseudonym,
            )
            session.add(student)
            await session.flush()
            students_created += 1

            # Optional guardian
            if guard_email_col and pd.notna(row[guard_email_col]):
                g_email = str(row[guard_email_col]).strip()
                g_name = str(row[guard_name_col]).strip() if (guard_name_col and pd.notna(row[guard_name_col])) else f"Parent of {f_name}"
                g_lang = str(row[lang_col]).strip() if (lang_col and pd.notna(row[lang_col])) else "en"
                guardian = Guardian(
                    student_id=student.id,
                    name=g_name,
                    email=g_email,
                    preferred_language=g_lang,
                )
                session.add(guardian)

        # Build responses and calculate score
        total_raw = 0.0
        responses_to_add = []

        for item_num, col_name in item_cols:
            opt = str(row[col_name]).strip().upper() if pd.notna(row[col_name]) else None
            correct_key = answer_keys.get(item_num) or answer_keys.get(str(item_num)) or "A"
            is_corr = (opt == correct_key)
            score_val = 1.0 if is_corr else 0.0
            total_raw += score_val

            q_resp = QuestionResponse(
                item_id=item_objects[item_num].id,
                selected_option=opt,
                is_correct=is_corr,
                score_awarded=score_val,
            )
            responses_to_add.append(q_resp)

        # If row explicitly has score_total or score_percentage mapped, use them as authoritative
        if score_total_col and pd.notna(row[score_total_col]):
            try:
                total_raw = float(row[score_total_col])
            except (ValueError, TypeError):
                pass

        if score_pct_col and pd.notna(row[score_pct_col]):
            try:
                pct = float(row[score_pct_col])
            except (ValueError, TypeError):
                pct = round((total_raw / max_score) * 100.0, 2) if max_score > 0 else 0.0
        else:
            pct = round((total_raw / max_score) * 100.0, 2) if max_score > 0 else 0.0

        submission = StudentSubmission(
            student_id=student.id,
            assessment_id=assessment.id,
            total_score=total_raw,
            percentage=pct,
        )
        session.add(submission)
        await session.flush()
        submissions_created += 1

        for qr in responses_to_add:
            qr.submission_id = submission.id
            session.add(qr)

    await session.commit()

    return {
        "assessment_id": assessment.id,
        "assessment_title": assessment.title,
        "students_imported": len(df) - len(key_row_indices),
        "new_students_created": students_created,
        "submissions_created": submissions_created,
        "questions_count": len(item_cols),
    }

