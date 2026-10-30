"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

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
  const [expandedItem, setExpandedItem] = useState<number | null>(7); // Default expand Q7 anomaly
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
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      id="validity"
    >
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Classical Item Analysis & Psychometrics</h3>
          <p className="text-xs text-slate-500">
            Computed deterministically using Kelley’s 27% rule (D = p_U - p_L) and difficulty index (p = R/N).
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white text-xs font-medium">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              filter === "ALL" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Items ({displayItems.length})
          </button>

          <button
            onClick={() => setFilter("ANOMALIES")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
              filter === "ANOMALIES"
                ? "bg-rose-600 text-white font-semibold"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Investigate Key ({flaggedCount})</span>
          </button>

          <button
            onClick={() => setFilter("FUNCTIONING")}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition cursor-pointer ${
              filter === "FUNCTIONING"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Functioning ({functioningCount})</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Q#</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Difficulty (p)</th>
              <th className="px-4 py-3">Discrimination (D)</th>
              <th className="px-4 py-3">Point-Biserial (r)</th>
              <th className="px-4 py-3">Status / Diagnostic Insight</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.map((item) => {
              const isAnomaly = Boolean(item.anomaly_flag) || item.discrimination_d < 0.2;
              const isExpanded = expandedItem === item.item_number;

              return (
                <React.Fragment key={item.item_number}>
                  <tr
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isAnomaly ? "bg-amber-50/40" : ""
                    }`}
                    onClick={() => setExpandedItem(isExpanded ? null : item.item_number)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">#{item.item_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">{item.topic_tag}</td>
                    <td className="px-4 py-3">
                      <span
                        translate="no"
                        className="notranslate inline-block w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-center leading-6 text-xs"
                      >
                        {item.correct_option}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.difficulty_p < 0.35
                            ? "bg-rose-100 text-rose-800"
                            : item.difficulty_p > 0.85
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.difficulty_p.toFixed(2)} ({item.difficulty_label})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          item.discrimination_d < 0
                            ? "bg-rose-600 text-white"
                            : item.discrimination_d < 0.2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.discrimination_d > 0 ? "+" : ""}
                        {item.discrimination_d.toFixed(2)} ({item.discrimination_label})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.point_biserial_r !== null ? item.point_biserial_r.toFixed(2) : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {item.anomaly_flag === "MISKEY_SUSPECTED" ? (
                        <div className="flex items-center space-x-1.5 text-rose-700 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                          <span>Potential Answer Key Error</span>
                        </div>
                      ) : item.discrimination_d < 0 ? (
                        <div className="flex items-center space-x-1.5 text-rose-700 text-xs font-semibold">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                          <span>Negative Discrimination</span>
                        </div>
                      ) : item.discrimination_d < 0.2 ? (
                        <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                          <span>Flat Discrimination</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                          <span>Functioning Item</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 inline text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 inline text-slate-400" />
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs leading-relaxed text-slate-700">
                            <span className="font-semibold text-slate-900 block mb-1">Pedagogical Anomaly Report:</span>
                            <span>{item.plain_english_insight}</span>
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-slate-700 block mb-2">
                              Distractor Analysis (Option Selections by Upper vs Lower 27% Groups):
                            </span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {item.option_breakdown.map((opt) => (
                                <div
                                  key={opt.option}
                                  className={`p-2.5 rounded-lg border text-xs ${
                                    opt.is_correct_key
                                      ? "bg-indigo-50 border-indigo-200"
                                      : opt.upper_pct > 0.4
                                      ? "bg-amber-50 border-amber-300"
                                      : "bg-white border-slate-200"
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span
                                      translate="no"
                                      className="notranslate font-bold text-slate-900"
                                    >
                                      Option {opt.option}{" "}
                                      {opt.is_correct_key && (
                                        <span className="text-indigo-600 text-[10px] uppercase font-semibold">(Key)</span>
                                      )}
                                    </span>
                                    <span className="text-slate-500 font-mono">
                                      {(opt.overall_pct * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 space-y-0.5">
                                    <div>Top 27%: {(opt.upper_pct * 100).toFixed(0)}%</div>
                                    <div>Bottom 27%: {(opt.lower_pct * 100).toFixed(0)}%</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
