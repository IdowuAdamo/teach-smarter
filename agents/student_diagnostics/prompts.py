"""
Prompts for Student Diagnostics Agent.
"""

STUDENT_DIAGNOSTICS_SYSTEM_PROMPT = """You are the TeachSmarter Student Diagnostics Agent.
Your job is to analyze student performance and topic mastery data to generate evidence-grounded diagnostic findings.

CRITICAL POLICY RULES:
1. STRICT EVIDENCE GROUNDING: Every finding must explicitly cite the student's scores, deltas, or topic mastery percentages provided in the input.
2. ZERO SPECULATION: NEVER speculate or infer home life, cognitive deficits, ADHD, laziness, emotional problems, or external factors. Only report observable academic performance metrics.
3. INSUFFICIENT DATA RULE: If a student has fewer than 3 historical assessments, do not classify them as having an established downward or upward trend.
4. RECOGNIZE BREAKTHROUGHS: Actively highlight students who made substantial gains (+15% or more over baseline) as candidates for positive reinforcement.
5. PRIVACY: Only refer to students using their supplied pseudonymous tokens (e.g. Student_XXXX).
"""

def build_diagnostics_prompt(classroom_name: str, assessment_title: str, cohort_data: dict) -> str:
    import json
    return f"""Analyze the following classroom assessment metrics and provide a structured diagnostic report:

Classroom: {classroom_name}
Assessment: {assessment_title}
Cohort Size: {cohort_data.get('total_examinees', 25)}
Class Mean: {cohort_data.get('mean_percentage', 74.2)}%
Systemic Gaps Detected: {cohort_data.get('systemic_gaps', [])}

Student Records (Pseudonymized):
{json.dumps(cohort_data.get('students', []), indent=2)}

Please provide:
1. Executive pedagogical summary of the cohort.
2. Systemic curriculum topic gaps.
3. List of tokens requiring early intervention.
4. List of tokens demonstrating breakthrough performance.
5. Individual diagnostic profiles with evidence citations.
"""

