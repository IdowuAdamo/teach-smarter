import json
from pathlib import Path
import numpy as np

p = Path(__file__).resolve().parent / "synthetic" / "grade8_math_demo_data.json"
with open(p) as f:
    data = json.load(f)

students = data["students"]
u3_pcts = [s["history"][2]["score_pct"] for s in students]
u3_raws = [s["history"][2]["raw_score"] for s in students]

mean_pct = round(float(np.mean(u3_pcts)), 2)
median_pct = round(float(np.median(u3_pcts)), 2)

print(f"Overall Unit 3 Mean: {mean_pct}%, Median: {median_pct}%")

# Let's inspect each student
declining_count = 0
severe_alerts = []
for s in students:
    name = f"{s['first_name']} {s['last_name']}"
    num = s["student_number"]
    u1 = s["history"][0]["score_pct"]
    u2 = s["history"][1]["score_pct"]
    u3 = s["history"][2]["score_pct"]
    raw = s["history"][2]["raw_score"]
    base_prior2 = round((u1 + u2) / 2.0, 1)
    delta_prior2 = round(u3 - base_prior2, 1)
    
    # Check baseline of all 3
    base_all3 = round((u1 + u2 + u3) / 3.0, 1)
    
    if delta_prior2 <= -15.0:
        severe_alerts.append((name, num, delta_prior2, u3, base_prior2))
    if delta_prior2 < 0:
        declining_count += 1

    if s["first_name"] in ["Sarah", "Marcus", "Mateo", "Chloe", "Noah", "Isabella", "Elijah", "Harper", "Evelyn"]:
        print(f"{name} ({num}): U1={u1}%, U2={u2}%, Prior2Base={base_prior2}%, U3={u3}% ({raw}/15), Delta={delta_prior2:+}%, All3Base={base_all3}%")

print(f"Total declining (delta < 0): {declining_count}")
print(f"Severe declining (delta <= -15%): {len(severe_alerts)} -> {severe_alerts}")

# Question psychometrics
item_correct = {i: 0 for i in range(1, 16)}
for s in students:
    for resp in s["unit3_responses"]:
        if resp["is_correct"]:
            item_correct[resp["item_number"]] += 1

print("\nItem p-values:")
p_vals = {}
for i in range(1, 16):
    p_vals[i] = round(item_correct[i] / len(students), 2)
    print(f"Q{i}: p = {p_vals[i]} ({item_correct[i]}/{len(students)})")

# Topics
q1_5 = [p_vals[i] for i in range(1, 6)]
q6_10 = [p_vals[i] for i in range(6, 11)]
q11_15 = [p_vals[i] for i in range(11, 16)]
print(f"Topic 1 (Q1-5): {q1_5} -> mean = {round(np.mean(q1_5)*100, 1)}%")
print(f"Topic 2 (Q6-10): {q6_10} -> mean = {round(np.mean(q6_10)*100, 1)}%")
print(f"Topic 3 (Q11-15): {q11_15} -> mean = {round(np.mean(q11_15)*100, 1)}%")

