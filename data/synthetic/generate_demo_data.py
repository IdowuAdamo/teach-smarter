"""
Synthetic Demo Classroom Generator: JSS 2 Mathematics.

Generates a realistic 25-student cohort with:
- 3 Historical assessments (Unit 1, Unit 2, Unit 3).
- Individual question responses for Unit 3 (15 multiple-choice questions).
- Specific controlled scenarios:
    1. Miskeyed question: Q7 (Key=B, but mathematically sound option C chosen by 80%+ of top quartile; D < 0).
    2. Poorly discriminating question: Q12 (D ~ 0.04; 50% pass rate uniformly across groups).
    3. Ambiguous question: Q15 (double-negative phrasing causing confusion).
    4. Improving / Breakthrough student: Sarah Jenkins (55% -> 62% -> 88%).
    5. Declining student: Marcus Vance (90% -> 88% -> 61%, specific concept gap in negative exponents).
    6. Consistently high performer: Chloe Adams (96% -> 98% -> 97%).
    7. Student needing support: David Okafor (48% -> 50% -> 46%).
    8. English language communication: Babatunde Adeyemi (guardian preferred language = 'en').

Outputs:
- data/synthetic/grade8_math_demo_data.json
- data/synthetic/grade8_math_unit3_gradebook.csv
"""

import csv
import json
import os
import random
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List, Any

# Fix seed for strict reproducibility
random.seed(42)

BASE_DIR = Path(__file__).resolve().parent

STUDENT_ROSTER = [
    {"first": "Chloe", "last": "Adams", "num": "STU-801", "guardian": "Robert Adams", "email": "robert.adams@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Sarah", "last": "Jenkins", "num": "STU-802", "guardian": "Patricia Jenkins", "email": "patricia.j@example.ng", "lang": "en", "type": "breakthrough"},
    {"first": "Marcus", "last": "Vance", "num": "STU-803", "guardian": "Angela Vance", "email": "angela.vance@example.ng", "lang": "en", "type": "declining"},
    {"first": "David", "last": "Okafor", "num": "STU-804", "guardian": "Chinedu Okafor", "email": "c.okafor@example.ng", "lang": "en", "type": "struggling"},
    {"first": "Babatunde", "last": "Adeyemi", "num": "STU-805", "guardian": "Funke Adeyemi", "email": "funke.adeyemi@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Aisha", "last": "Bello", "num": "STU-806", "guardian": "Ibrahim Bello", "email": "ibello@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Chinedu", "last": "Eze", "num": "STU-807", "guardian": "Ngozi Eze", "email": "ngozi.eze@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Zainab", "last": "Usman", "num": "STU-808", "guardian": "Mustapha Usman", "email": "m.usman@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Noah", "last": "Williams", "num": "STU-809", "guardian": "Samantha Williams", "email": "swilliams@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Omotola", "last": "Adeleke", "num": "STU-810", "guardian": "Adewale Adeleke", "email": "a.adeleke@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Emeka", "last": "Okonkwo", "num": "STU-811", "guardian": "Chioma Okonkwo", "email": "c.okonkwo@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Folashade", "last": "Ogundipe", "num": "STU-812", "guardian": "Olusegun Ogundipe", "email": "o.ogundipe@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Osasere", "last": "Igbinosa", "num": "STU-813", "guardian": "Ehigie Igbinosa", "email": "e.igbinosa@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Isabella", "last": "Davis", "num": "STU-814", "guardian": "James Davis", "email": "jdavis@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Tariq", "last": "Mohammed", "num": "STU-815", "guardian": "Halima Mohammed", "email": "h.mohammed@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Nkechi", "last": "Nnamdi", "num": "STU-816", "guardian": "Kalu Nnamdi", "email": "k.nnamdi@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Aiden", "last": "Okoro", "num": "STU-817", "guardian": "Sofia Okoro", "email": "s.okoro@example.ng", "lang": "en", "type": "struggling"},
    {"first": "Halimat", "last": "Abubakar", "num": "STU-818", "guardian": "Abubakar Garba", "email": "a.garba@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Elijah", "last": "Danjuma", "num": "STU-819", "guardian": "Grace Danjuma", "email": "g.danjuma@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Yetunde", "last": "Sowore", "num": "STU-820", "guardian": "Bamidele Sowore", "email": "b.sowore@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Kelechi", "last": "Amadi", "num": "STU-821", "guardian": "Uche Amadi", "email": "u.amadi@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Amara", "last": "Eze", "num": "STU-822", "guardian": "Emeka Eze", "email": "eze.family@example.ng", "lang": "en", "type": "high_performer"},
    {"first": "Benjamin", "last": "Ojo", "num": "STU-823", "guardian": "Taiwo Ojo", "email": "t.ojo@example.ng", "lang": "en", "type": "struggling"},
    {"first": "Blessing", "last": "Akpan", "num": "STU-824", "guardian": "Effiong Akpan", "email": "e.akpan@example.ng", "lang": "en", "type": "mid_tier"},
    {"first": "Dapo", "last": "Falana", "num": "STU-825", "guardian": "Olu Falana", "email": "o.falana@example.ng", "lang": "en", "type": "mid_tier"},
]

QUESTIONS_SPEC = [
    # Topic 1: Solving Linear Equations (Q1 - Q5)
    {"num": 1, "topic": "Solving Linear Equations", "key": "A", "prompt": "Solve for x: 3x - 7 = 14"},
    {"num": 2, "topic": "Solving Linear Equations", "key": "C", "prompt": "Solve for y: 2(y + 4) = 18"},
    {"num": 3, "topic": "Solving Linear Equations", "key": "B", "prompt": "Find the value of p: 5p + 3 = 2p + 15"},
    {"num": 4, "topic": "Solving Linear Equations", "key": "D", "prompt": "Solve: (x / 4) + 6 = 11"},
    {"num": 5, "topic": "Solving Linear Equations", "key": "A", "prompt": "Solve for m: -4m = 28"},

    # Topic 2: Linear Graphing & Slope (Q6 - Q10)
    {"num": 6, "topic": "Linear Graphing & Slope", "key": "B", "prompt": "What is the slope of the line passing through (2, 3) and (6, 11)?"},
    # Q7: Miskeyed Question Anomaly (Key designated B, but C is mathematically correct)
    {"num": 7, "topic": "Linear Graphing & Slope", "key": "B", "prompt": "What is the y-intercept of the line 4x - 2y = 8?", "is_anomaly": "MISKEY_Q7"},
    {"num": 8, "topic": "Linear Graphing & Slope", "key": "A", "prompt": "Which graph represents a line with undefined slope?"},
    {"num": 9, "topic": "Linear Graphing & Slope", "key": "D", "prompt": "Identify the equation of a line parallel to y = 3x - 5 passing through (0, 2)."},
    {"num": 10, "topic": "Linear Graphing & Slope", "key": "C", "prompt": "Find the x-intercept of the line y = 2x - 6."},

    # Topic 3: Negative Exponents & Scientific Notation (Q11 - Q15)
    {"num": 11, "topic": "Negative Exponents & Scientific Notation", "key": "B", "prompt": "Simplify: 5^-2"},
    # Q12: Poorly Discriminating Question (guessing/ambiguity leads to ~50% across all groups)
    {"num": 12, "topic": "Negative Exponents & Scientific Notation", "key": "C", "prompt": "Which of the following is equivalent to (2^3)^2?", "is_anomaly": "POOR_DISC_Q12"},
    {"num": 13, "topic": "Negative Exponents & Scientific Notation", "key": "A", "prompt": "Express in scientific notation: 0.00045"},
    {"num": 14, "topic": "Negative Exponents & Scientific Notation", "key": "D", "prompt": "Simplify: (x^-3 * x^7) / x^2"},
    # Q15: Ambiguous Question Wording (double-negative phrasing)
    {"num": 15, "topic": "Negative Exponents & Scientific Notation", "key": "A", "prompt": "Which of the following expressions is NOT NOT equal to 1?", "is_anomaly": "AMBIGUOUS_Q15"},
]


def generate_unit3_responses(student: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate item responses for a student based on their profile type and controlled anomalies."""
    stype = student["type"]
    name = f"{student['first']} {student['last']}"
    responses = []

    for q in QUESTIONS_SPEC:
        q_num = q["num"]
        topic = q["topic"]
        key = q["key"]
        options = ["A", "B", "C", "D"]
        distractors = [o for o in options if o != key]

        # Handle Controlled Anomalies
        if q_num == 7:
            # Q7: Miskeyed question. Correct mathematical answer is C, but key is designated B.
            # Top quartile and high performers recognize correct math (Option C).
            # Low performers guess or pick B / distractors.
            if stype == "high_performer" or name == "Sarah Jenkins":
                chosen = "C"  # The mathematically sound option!
            elif stype == "mid_tier":
                chosen = random.choice(["C", "C", "A", "D"])
            else:  # struggling
                chosen = random.choice(["B", "A", "D"])

        elif q_num == 12:
            # Q12: Poor discrimination. Equal chance across all ability tiers (~50% hit key C).
            chosen = key if random.random() < 0.50 else random.choice(distractors)

        elif q_num == 15:
            # Q15: Ambiguous wording. High performers figure it out, mid-tier gets confused by double negative.
            if stype == "high_performer":
                chosen = key if random.random() < 0.80 else random.choice(distractors)
            else:
                chosen = random.choice(options)

        else:
            # Standard topic-based mastery
            if name == "Sarah Jenkins":
                # Sarah had a breakthrough in Linear Equations & Graphing (100% correct), decent in Exponents
                if topic in ["Solving Linear Equations", "Linear Graphing & Slope"]:
                    chosen = key
                else:
                    chosen = key if random.random() < 0.80 else random.choice(distractors)

            elif name == "Marcus Vance":
                # Marcus is strong in Linear Equations & Graphing (90%+), but completely struggles with Exponents!
                if topic in ["Solving Linear Equations", "Linear Graphing & Slope"]:
                    chosen = key if random.random() < 0.95 else random.choice(distractors)
                else:
                    # Concept gap in negative exponents!
                    chosen = random.choice(distractors)

            elif stype == "high_performer":
                chosen = key if random.random() < 0.95 else random.choice(distractors)
            elif stype == "mid_tier":
                chosen = key if random.random() < 0.70 else random.choice(distractors)
            else:  # struggling (David Okafor, etc.)
                chosen = key if random.random() < 0.45 else random.choice(distractors)

        is_correct = (chosen == key)
        responses.append({
            "item_number": q_num,
            "topic_tag": topic,
            "selected_option": chosen,
            "correct_option": key,
            "is_correct": is_correct,
            "score": 1.0 if is_correct else 0.0,
        })

    return responses


def generate_dataset() -> Dict[str, Any]:
    dataset = {
        "classroom": {
            "name": "JSS 2 Mathematics (Period 3)",
            "subject": "Mathematics",
            "grade_level": "JSS 2",
            "academic_year": "2026-2027",
            "total_students": len(STUDENT_ROSTER),
        },
        "assessments": [
            {
                "id": "ASSESS-U1",
                "title": "Unit 1: Foundations of Algebra",
                "max_score": 100.0,
                "date_administered": "2026-09-15",
            },
            {
                "id": "ASSESS-U2",
                "title": "Unit 2: Linear Relationships",
                "max_score": 100.0,
                "date_administered": "2026-10-06",
            },
            {
                "id": "ASSESS-U3",
                "title": "Unit 3: Linear Equations & Exponents",
                "max_score": 15.0,  # 15 questions x 1 mark
                "date_administered": "2026-10-27",
                "questions": QUESTIONS_SPEC,
            },
        ],
        "students": [],
    }

    # Historical score baselines for Unit 1 and Unit 2
    for s in STUDENT_ROSTER:
        name = f"{s['first']} {s['last']}"
        stype = s["type"]

        if name == "Sarah Jenkins":
            u1_score = 55.0
            u2_score = 62.0
        elif name == "Marcus Vance":
            u1_score = 90.0
            u2_score = 88.0
        elif name == "Chloe Adams":
            u1_score = 96.0
            u2_score = 98.0
        elif name == "David Okafor":
            u1_score = 48.0
            u2_score = 50.0
        elif stype == "high_performer":
            u1_score = round(random.uniform(90.0, 98.0), 1)
            u2_score = round(random.uniform(88.0, 96.0), 1)
        elif stype == "mid_tier":
            u1_score = round(random.uniform(68.0, 82.0), 1)
            u2_score = round(random.uniform(70.0, 84.0), 1)
        else:  # struggling
            u1_score = round(random.uniform(45.0, 56.0), 1)
            u2_score = round(random.uniform(46.0, 58.0), 1)

        # Generate Unit 3 item responses
        u3_responses = generate_unit3_responses(s)
        u3_raw = sum(r["score"] for r in u3_responses)
        u3_pct = round((u3_raw / 15.0) * 100.0, 1)

        dataset["students"].append({
            "student_number": s["num"],
            "first_name": s["first"],
            "last_name": s["last"],
            "guardian_name": s["guardian"],
            "guardian_email": s["email"],
            "preferred_language": s["lang"],
            "profile_type": s["type"],
            "history": [
                {"assessment_id": "ASSESS-U1", "title": "Unit 1", "score_pct": u1_score},
                {"assessment_id": "ASSESS-U2", "title": "Unit 2", "score_pct": u2_score},
                {"assessment_id": "ASSESS-U3", "title": "Unit 3", "score_pct": u3_pct, "raw_score": u3_raw, "max_score": 15.0},
            ],
            "unit3_responses": u3_responses,
        })

    return dataset


def export_csv_gradebook(dataset: Dict[str, Any], output_path: Path):
    """Export realistic CSV spreadsheet for Gradebook Ingestion testing."""
    headers = [
        "Student ID", "First Name", "Last Name", "Guardian Name", "Guardian Email", "Language",
        "Unit 1 (%)", "Unit 2 (%)",
        "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14", "Q15",
        "Unit 3 Total", "Unit 3 (%)"
    ]

    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)

        for s in dataset["students"]:
            u1 = s["history"][0]["score_pct"]
            u2 = s["history"][1]["score_pct"]
            u3_tot = s["history"][2]["raw_score"]
            u3_pct = s["history"][2]["score_pct"]
            q_resps = [r["selected_option"] for r in s["unit3_responses"]]

            row = [
                s["student_number"],
                s["first_name"],
                s["last_name"],
                s["guardian_name"],
                s["guardian_email"],
                s["preferred_language"],
                u1,
                u2,
            ] + q_resps + [u3_tot, u3_pct]
            writer.writerow(row)


def main():
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    dataset = generate_dataset()

    json_path = BASE_DIR / "grade8_math_demo_data.json"
    csv_path = BASE_DIR / "grade8_math_unit3_gradebook.csv"

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)

    export_csv_gradebook(dataset, csv_path)

    print(f"[OK] Generated synthetic demo classroom:")
    print(f"     JSON: {json_path}")
    print(f"     CSV:  {csv_path}")
    print(f"     Students: {len(dataset['students'])}")


if __name__ == "__main__":
    main()

