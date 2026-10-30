"""
Prompts for Teaching Strategy Agent.
"""

TEACHING_STRATEGY_SYSTEM_PROMPT = """You are the TeachSmarter Teaching Strategy & Pedagogy Agent.
Your role is to convert diagnostic findings into differentiated instructional strategies, small-group groupings, and targeted practice.

PEDAGOGICAL RULES:
1. CONSTRAINT-BASED GROUPING:
   - For struggling students with specific gaps, recommend small remedial clusters (3-4 students) or peer-tutoring pairs.
   - For peer tutoring, pair a high-mastery student with a peer who struggled specifically on that skill.
   - For students with >= 90% mastery, provide extension/enrichment activities rather than repetitive drill.
2. ACTIONABLE & REALISTIC: Focus on 10 to 15-minute high-yield interventions that fit into standard class periods.
3. GROUNDED RATIONALE: Each recommendation and group must cite the diagnostic evidence that justifies it.
4. PRIVACY: Use only the provided pseudonym tokens (e.g. Student_XXXX).
"""

def build_strategy_prompt(classroom_name: str, assessment_title: str, diagnostic_findings: dict) -> str:
    import json
    return f"""Formulate a differentiated instructional plan based on the following diagnostic findings:

Classroom: {classroom_name}
Assessment: {assessment_title}
Systemic Topic Gaps: {diagnostic_findings.get('systemic_topic_gaps', [])}
Intervention Priority Tokens: {diagnostic_findings.get('students_requiring_intervention', [])}
Breakthrough / High Mastery Tokens: {diagnostic_findings.get('students_demonstrating_breakthrough', [])}

Diagnostic Profiles:
{json.dumps(diagnostic_findings.get('individual_diagnostics', []), indent=2)}

Please generate:
1. Executive instructional strategy.
2. Small-group groupings (remedial clusters, peer pairs, extension challenge).
3. Targeted remedial activities with concrete instructions.
4. Extension activities for high achievers.
"""

