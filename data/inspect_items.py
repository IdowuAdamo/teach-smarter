import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from app.analytics.discrimination import calculate_item_discrimination
from app.analytics.distractors import analyze_distractors


p = Path(__file__).resolve().parent / "synthetic" / "grade8_math_demo_data.json"
with open(p) as f:
    data = json.load(f)

students = data["students"]
total_scores = [s["history"][2]["raw_score"] for s in students]

for q_num in [7, 12, 14, 15]:
    scores = []
    selected = []
    for s in students:
        resp = next(r for r in s["unit3_responses"] if r["item_number"] == q_num)
        scores.append(1 if resp["is_correct"] else 0)
        selected.append(resp["selected_option"])
    disc = calculate_item_discrimination(f"Q{q_num}", scores, total_scores)
    dist = analyze_distractors(f"Q{q_num}", selected, total_scores, data["assessments"][2]["questions"][q_num-1]["key"])
    print(f"\n--- Question {q_num} (Key {data['assessments'][2]['questions'][q_num-1]['key']}) ---")
    print(f"D-value: {disc.d_value:.2f} ({disc.discrimination_label}), p_U={disc.p_upper}, p_L={disc.p_lower}")
    print("Distractors:")
    for b in dist.option_breakdown:
        print(f"  Option {b.option}: overall={b.overall_pct*100:.0f}%, top={b.upper_pct*100:.0f}%, bot={b.lower_pct*100:.0f}%")
    print(f"Summary: {dist.plain_english_summary}")
    print(f"Anomalous options: {dist.anomalous_options}, Miskey suspected: {dist.miskey_suspected}")
