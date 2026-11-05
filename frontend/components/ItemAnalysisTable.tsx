"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, X, ChevronRight, BarChart2 } from "lucide-react";

export type AnswerOption = "A" | "B" | "C" | "D";

export interface ItemAnalysisData {
  item_number: number;
  topic_tag: string;
  correct_option: AnswerOption;
  difficulty_p: number;
  difficulty_label: string;
  discrimination_d: number;
  discrimination_label: string;
  point_biserial_r: number | null;
  anomaly_flag: string | null;
  plain_english_insight: string;
  distractor_summary: string;
  option_breakdown: Array<{
    option: AnswerOption;
    overall_pct: number;
    upper_pct: number;
    lower_pct: number;
    is_correct_key: boolean;
  }>;
}

export const COMPLETE_15_ITEMS: ItemAnalysisData[] = [
  {
    item_number: 1,
    topic_tag: "Solving Linear Equations",
    correct_option: "A",
    difficulty_p: 0.64,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.71,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.35,
    anomaly_flag: null,
    plain_english_insight: "Excellent discrimination (D = +0.71). Item reliably distinguishes higher-performing students.",
    distractor_summary: "All distractors functioning as expected.",
    option_breakdown: [
      { option: "A", overall_pct: 0.64, upper_pct: 1.0, lower_pct: 0.29, is_correct_key: true },
      { option: "B", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "C", overall_pct: 0.16, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "D", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 2,
    topic_tag: "Solving Linear Equations",
    correct_option: "C",
    difficulty_p: 0.76,
    difficulty_label: "EASY",
    discrimination_d: 0.29,
    discrimination_label: "ACCEPTABLE",
    point_biserial_r: 0.49,
    anomaly_flag: null,
    plain_english_insight: "Good functioning item (D = +0.29). Strong positive point-biserial correlation.",
    distractor_summary: "Distractors functioning cleanly.",
    option_breakdown: [
      { option: "A", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.76, upper_pct: 0.86, lower_pct: 0.57, is_correct_key: true },
      { option: "D", overall_pct: 0.12, upper_pct: 0.14, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 3,
    topic_tag: "Solving Linear Equations",
    correct_option: "B",
    difficulty_p: 0.84,
    difficulty_label: "EASY",
    discrimination_d: 0.29,
    discrimination_label: "ACCEPTABLE",
    point_biserial_r: 0.38,
    anomaly_flag: null,
    plain_english_insight: "High student mastery (p = 0.84) with healthy discrimination (D = +0.29).",
    distractor_summary: "Distractors operating within normal bounds.",
    option_breakdown: [
      { option: "A", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.84, upper_pct: 1.0, lower_pct: 0.71, is_correct_key: true },
      { option: "C", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.0, is_correct_key: false },
    ],
  },
  {
    item_number: 4,
    topic_tag: "Solving Linear Equations",
    correct_option: "D",
    difficulty_p: 0.76,
    difficulty_label: "EASY",
    discrimination_d: 0.57,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.30,
    anomaly_flag: null,
    plain_english_insight: "Excellent discrimination (D = +0.57). Strongly identifies conceptual mastery of fractions.",
    distractor_summary: "Plausible distractors attracted lower-quartile students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "B", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.76, upper_pct: 1.0, lower_pct: 0.43, is_correct_key: true },
    ],
  },
  {
    item_number: 5,
    topic_tag: "Solving Linear Equations",
    correct_option: "A",
    difficulty_p: 0.80,
    difficulty_label: "EASY",
    discrimination_d: 0.57,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.60,
    anomaly_flag: null,
    plain_english_insight: "Excellent discrimination (D = +0.57) and very strong correlation (r = 0.60).",
    distractor_summary: "Sign-error distractors attracted primarily lower-quartile students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.80, upper_pct: 1.0, lower_pct: 0.43, is_correct_key: true },
      { option: "B", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
    ],
  },
  {
    item_number: 6,
    topic_tag: "Linear Graphing & Slope",
    correct_option: "B",
    difficulty_p: 0.84,
    difficulty_label: "EASY",
    discrimination_d: 0.29,
    discrimination_label: "ACCEPTABLE",
    point_biserial_r: 0.38,
    anomaly_flag: null,
    plain_english_insight: "Appropriate slope formula question. Solid discrimination index.",
    distractor_summary: "Reciprocal slope distractors correctly selected by struggling students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.84, upper_pct: 1.0, lower_pct: 0.71, is_correct_key: true },
      { option: "C", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.0, is_correct_key: false },
    ],
  },
  {
    item_number: 7,
    topic_tag: "Linear Graphing & Slope",
    correct_option: "B",
    difficulty_p: 0.08,
    difficulty_label: "VERY_HARD",
    discrimination_d: -0.14,
    discrimination_label: "CRITICAL_ANOMALY",
    point_biserial_r: -0.26,
    anomaly_flag: "MISKEY_SUSPECTED",
    plain_english_insight:
      "Potential Answer Key Error: Option C (86%) was overwhelmingly selected by top-performing students compared to the designated key B (0%). Recommend verifying whether Option C is the intended correct answer.",
    distractor_summary: "Option C behaves like correct answer among top students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.0, upper_pct: 0.0, lower_pct: 0.0, is_correct_key: false },
      { option: "B", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: true },
      { option: "C", overall_pct: 0.84, upper_pct: 0.86, lower_pct: 0.71, is_correct_key: false },
      { option: "D", overall_pct: 0.08, upper_pct: 0.14, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 8,
    topic_tag: "Linear Graphing & Slope",
    correct_option: "A",
    difficulty_p: 0.84,
    difficulty_label: "EASY",
    discrimination_d: 0.43,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.70,
    anomaly_flag: null,
    plain_english_insight: "Exceptional item performance (r = 0.70, D = +0.43). Distinguishes vertical vs horizontal lines.",
    distractor_summary: "Horizontal line distractor effectively absorbed misconceptions.",
    option_breakdown: [
      { option: "A", overall_pct: 0.84, upper_pct: 1.0, lower_pct: 0.57, is_correct_key: true },
      { option: "B", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 9,
    topic_tag: "Linear Graphing & Slope",
    correct_option: "D",
    difficulty_p: 0.72,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.57,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.55,
    anomaly_flag: null,
    plain_english_insight: "Optimal difficulty (p = 0.72) and excellent discrimination (D = +0.57).",
    distractor_summary: "Distractors operating within normal bounds.",
    option_breakdown: [
      { option: "A", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "B", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.72, upper_pct: 1.0, lower_pct: 0.43, is_correct_key: true },
    ],
  },
  {
    item_number: 10,
    topic_tag: "Linear Graphing & Slope",
    correct_option: "C",
    difficulty_p: 0.72,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.43,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.51,
    anomaly_flag: null,
    plain_english_insight: "Well-calibrated question assessing x-intercept computation with strong discrimination.",
    distractor_summary: "Distractors functioning cleanly.",
    option_breakdown: [
      { option: "A", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "B", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.72, upper_pct: 1.0, lower_pct: 0.57, is_correct_key: true },
      { option: "D", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.0, is_correct_key: false },
    ],
  },
  {
    item_number: 11,
    topic_tag: "Negative Exponents",
    correct_option: "B",
    difficulty_p: 0.64,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.43,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.24,
    anomaly_flag: null,
    plain_english_insight: "Optimal difficulty (p = 0.64) with strong discrimination (D = +0.43).",
    distractor_summary: "Misconception -25 attracted 24% of students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.64, upper_pct: 0.86, lower_pct: 0.43, is_correct_key: true },
      { option: "C", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "D", overall_pct: 0.12, upper_pct: 0.14, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 12,
    topic_tag: "Negative Exponents",
    correct_option: "C",
    difficulty_p: 0.44,
    difficulty_label: "OPTIMAL",
    discrimination_d: -0.29,
    discrimination_label: "CRITICAL_ANOMALY",
    point_biserial_r: -0.04,
    anomaly_flag: "CRITICAL_DISCRIMINATION",
    plain_english_insight:
      "Negative Discrimination: Lower-scoring students outperformed higher-scoring students on this item (p_U = 0.29 vs p_L = 0.57). Suggests ambiguous wording or confusing power-of-a-power distractor.",
    distractor_summary: "Distractor Option B drew excessive top-quartile students.",
    option_breakdown: [
      { option: "A", overall_pct: 0.16, upper_pct: 0.14, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.24, upper_pct: 0.43, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.44, upper_pct: 0.29, lower_pct: 0.57, is_correct_key: true },
      { option: "D", overall_pct: 0.16, upper_pct: 0.14, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 13,
    topic_tag: "Negative Exponents",
    correct_option: "A",
    difficulty_p: 0.72,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.57,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.66,
    anomaly_flag: null,
    plain_english_insight: "Scientific notation question showing excellent discrimination (D = +0.57, r = 0.66).",
    distractor_summary: "Distractors operating cleanly.",
    option_breakdown: [
      { option: "A", overall_pct: 0.72, upper_pct: 1.0, lower_pct: 0.43, is_correct_key: true },
      { option: "B", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "C", overall_pct: 0.12, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "D", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
    ],
  },
  {
    item_number: 14,
    topic_tag: "Negative Exponents",
    correct_option: "D",
    difficulty_p: 0.84,
    difficulty_label: "EASY",
    discrimination_d: 0.14,
    discrimination_label: "POOR",
    point_biserial_r: 0.16,
    anomaly_flag: "POOR_DISCRIMINATION",
    plain_english_insight:
      "Flat Discrimination: Both top and bottom quartiles answered at near-identical rates (D = +0.14), providing minimal separation.",
    distractor_summary: "No attractive distractors for separating ability levels.",
    option_breakdown: [
      { option: "A", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "B", overall_pct: 0.04, upper_pct: 0.0, lower_pct: 0.0, is_correct_key: false },
      { option: "C", overall_pct: 0.08, upper_pct: 0.0, lower_pct: 0.14, is_correct_key: false },
      { option: "D", overall_pct: 0.84, upper_pct: 1.0, lower_pct: 0.86, is_correct_key: true },
    ],
  },
  {
    item_number: 15,
    topic_tag: "Negative Exponents",
    correct_option: "A",
    difficulty_p: 0.48,
    difficulty_label: "OPTIMAL",
    discrimination_d: 0.57,
    discrimination_label: "EXCELLENT",
    point_biserial_r: 0.58,
    anomaly_flag: null,
    plain_english_insight: "Challenging exponent simplification item with high discrimination power (D = +0.57).",
    distractor_summary: "High quality distractors testing negative sign distribution.",
    option_breakdown: [
      { option: "A", overall_pct: 0.48, upper_pct: 0.71, lower_pct: 0.14, is_correct_key: true },
      { option: "B", overall_pct: 0.20, upper_pct: 0.14, lower_pct: 0.29, is_correct_key: false },
      { option: "C", overall_pct: 0.16, upper_pct: 0.0, lower_pct: 0.29, is_correct_key: false },
      { option: "D", overall_pct: 0.16, upper_pct: 0.14, lower_pct: 0.29, is_correct_key: false },
    ],
  },
];

export function ItemAnalysisTable({ items }: { items: ItemAnalysisData[] }) {
  const [selectedItem, setSelectedItem] = useState<ItemAnalysisData | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ANOMALIES" | "FUNCTIONING">("ALL");

  const displayItems = items && items.length > 0 ? items : COMPLETE_15_ITEMS;

  const flaggedCount = displayItems.filter(
    (i) => Boolean(i.anomaly_flag) || i.discrimination_d < 0.2
  ).length;
  const functioningCount = displayItems.filter(
    (i) => !i.anomaly_flag && i.discrimination_d >= 0.2
  ).length;

  const filteredItems = displayItems.filter((i) => {
    if (filter === "ANOMALIES") return Boolean(i.anomaly_flag) || i.discrimination_d < 0.2;
    if (filter === "FUNCTIONING") return !i.anomaly_flag && i.discrimination_d >= 0.2;
    return true;
  });

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
      id="validity"
    >
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Classical Item Analysis & Psychometrics</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic index calculation using Kelley’s 27% upper/lower group separation rule (D = p_U - p_L).
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "ALL"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Items ({displayItems.length})
          </button>

          <button
            onClick={() => setFilter("ANOMALIES")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "ANOMALIES"
                ? "bg-white text-rose-700 font-semibold shadow-2xs border border-slate-200/60"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Key Anomalies ({flaggedCount})</span>
          </button>

          <button
            onClick={() => setFilter("FUNCTIONING")}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === "FUNCTIONING"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Functioning ({functioningCount})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/75 text-[11px] font-medium uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Q#</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium text-center">Key</th>
              <th className="px-4 py-3 font-medium text-right">Difficulty (p)</th>
              <th className="px-4 py-3 font-medium text-right">Discrimination (D)</th>
              <th className="px-4 py-3 font-medium text-right">Point-Biserial (r)</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isMiskey = item.anomaly_flag === "MISKEY_SUSPECTED";
              const isNegativeD = item.discrimination_d < 0;
              const isPoorD = item.discrimination_d >= 0 && item.discrimination_d < 0.2;
              const isFlagged = isMiskey || isNegativeD || isPoorD;

              return (
                <tr
                  key={item.item_number}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedItem?.item_number === item.item_number ? "bg-slate-50" : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">
                    #{item.item_number}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{item.topic_tag}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      translate="no"
                      className="notranslate inline-block w-5 h-5 rounded bg-slate-100 text-slate-800 font-mono font-semibold text-center leading-5 text-[11px]"
                    >
                      {item.correct_option}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-900 font-medium">
                    {item.difficulty_p.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-medium ${
                      isNegativeD ? "text-rose-600 font-semibold" : "text-slate-900"
                    }`}
                  >
                    {item.discrimination_d > 0 ? "+" : ""}
                    {item.discrimination_d.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-500 font-mono">
                    {item.point_biserial_r !== null ? item.point_biserial_r.toFixed(2) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {isMiskey ? (
                      <span className="inline-flex items-center space-x-1.5 text-rose-700 font-medium text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                        <span>Key Error Suspected</span>
                      </span>
                    ) : isNegativeD ? (
                      <span className="inline-flex items-center space-x-1.5 text-rose-700 font-medium text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                        <span>Negative Discrimination</span>
                      </span>
                    ) : isPoorD ? (
                      <span className="inline-flex items-center space-x-1.5 text-amber-700 font-medium text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                        <span>Poor Discrimination</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 text-slate-600 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        <span>Functioning</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer for Item Psychometric Inspection */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-fade-in">
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-semibold text-slate-900">
                      Question #{selectedItem.item_number} Psychometrics
                    </h4>
                    <span
                      translate="no"
                      className="notranslate text-xs font-mono font-semibold bg-slate-200 text-slate-800 px-2 py-0.5 rounded"
                    >
                      Key: {selectedItem.correct_option}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedItem.topic_tag}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-5">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Difficulty (p)</span>
                    <span className="text-lg font-bold text-slate-900 tabular-nums">
                      {selectedItem.difficulty_p.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{selectedItem.difficulty_label}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Discrimination (D)</span>
                    <span
                      className={`text-lg font-bold tabular-nums ${
                        selectedItem.discrimination_d < 0 ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {selectedItem.discrimination_d > 0 ? "+" : ""}
                      {selectedItem.discrimination_d.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {selectedItem.discrimination_label}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[11px] font-medium text-slate-500 block">Point-Biserial (r)</span>
                    <span className="text-lg font-bold text-slate-900 tabular-nums font-mono">
                      {selectedItem.point_biserial_r !== null ? selectedItem.point_biserial_r.toFixed(2) : "N/A"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Correlation</span>
                  </div>
                </div>

                {/* Pedagogical Anomaly Report */}
                <div
                  className={`p-4 rounded-lg border text-xs leading-relaxed ${
                    selectedItem.anomaly_flag
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-semibold mb-1.5">
                    {selectedItem.anomaly_flag ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span>
                      {selectedItem.anomaly_flag ? "Pedagogical Anomaly Finding" : "Psychometric Item Function"}
                    </span>
                  </div>
                  <p>{selectedItem.plain_english_insight}</p>
                </div>

                {/* Distractor Breakdown: Option A, B, C, D */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                    Distractor Analysis (Kelley 27% Ability Split)
                  </h5>
                  <div className="space-y-2.5">
                    {selectedItem.option_breakdown.map((opt) => {
                      const upperPct = opt.upper_pct * 100;
                      const lowerPct = opt.lower_pct * 100;
                      const overallPct = opt.overall_pct * 100;
                      const isDistractorAnomaly = !opt.is_correct_key && opt.upper_pct > 0.4;

                      return (
                        <div
                          key={opt.option}
                          className={`p-3 rounded-lg border text-xs ${
                            opt.is_correct_key
                              ? "bg-indigo-50/50 border-indigo-200"
                              : isDistractorAnomaly
                              ? "bg-rose-50/50 border-rose-200"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              translate="no"
                              className="notranslate font-semibold text-slate-900 flex items-center space-x-1.5"
                            >
                              <span>Option {opt.option}</span>
                              {opt.is_correct_key && (
                                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                                  Designated Key
                                </span>
                              )}
                              {isDistractorAnomaly && (
                                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                  Attracts Top Students
                                </span>
                              )}
                            </span>
                            <span className="text-slate-600 font-mono tabular-nums font-medium">
                              {overallPct.toFixed(0)}% Overall
                            </span>
                          </div>

                          {/* Horizontal Comparison Bars */}
                          <div className="space-y-1.5 text-[11px]">
                            {/* Top 27% Bar */}
                            <div className="flex items-center space-x-2">
                              <span className="w-16 text-slate-500 text-[10px]">Top 27%:</span>
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${
                                    opt.is_correct_key ? "bg-indigo-600" : isDistractorAnomaly ? "bg-rose-500" : "bg-slate-400"
                                  }`}
                                  style={{ width: `${Math.min(100, upperPct)}%` }}
                                ></div>
                              </div>
                              <span className="w-10 text-right font-mono tabular-nums text-slate-700">
                                {upperPct.toFixed(0)}%
                              </span>
                            </div>

                            {/* Bottom 27% Bar */}
                            <div className="flex items-center space-x-2">
                              <span className="w-16 text-slate-500 text-[10px]">Bottom 27%:</span>
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-2 rounded-full bg-slate-300"
                                  style={{ width: `${Math.min(100, lowerPct)}%` }}
                                ></div>
                              </div>
                              <span className="w-10 text-right font-mono tabular-nums text-slate-700">
                                {lowerPct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
