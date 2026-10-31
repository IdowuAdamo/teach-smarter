"""
Prompts for Ingestion Agent.
"""

from typing import List, Dict, Any

INGESTION_SYSTEM_PROMPT = """You are the Ingestion Intelligence Agent for TeachSmarter, an educational analytics platform.
Your task is to analyze ambiguous spreadsheet column headers from school gradebooks and map them to standardized target fields:
- student_number: Unique student ID or matriculation number (e.g., STU-801, RegNo, AdmNo)
- first_name: Student's first or given name
- last_name: Student's surname or family name
- full_name: Full student name (when first and last are combined)
- guardian_name: Parent or guardian name
- guardian_email: Parent or guardian email address
- language: Preferred home communication language (e.g., en, fr, ha, ig, yo)
- item_response: Single multiple choice response column (e.g., Q1, Item 4, Question 12)
- score_total: Total raw score achieved on the test
- score_percentage: Percentage score achieved (0-100)
- ignore: Extraneous or irrelevant columns (e.g., serial number, comments, empty columns)

Rules:
1. Base your classification strictly on the header name and provided sample values.
2. If uncertain, assign lower confidence and mark is_ambiguous=True to trigger teacher review.
3. For question columns, accurately extract the integer item_number.
"""


def build_column_disambiguation_prompt(
    filename: str,
    ambiguous_columns: List[Dict[str, Any]],
) -> str:
    prompt = f"Spreadsheet Filename: {filename}\n"
    prompt += "The following columns could not be matched with high confidence by deterministic heuristics:\n\n"
    for col in ambiguous_columns:
        prompt += f"- Column Header: '{col['detected_column']}'\n"
        prompt += f"  Sample Values: {col.get('sample_values', [])}\n"
    prompt += "\nProvide a structured mapping proposal for each column above."
    return prompt

