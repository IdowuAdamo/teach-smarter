"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

export interface ItemAnalysisData {
  item_number: number;
  topic_tag: string;
  correct_option: string;
  difficulty_p: number;
  difficulty_label: string;
  discrimination_d: number;
  discrimination_label: string;
  point_biserial_r: number | null;
  anomaly_flag: string | null;
  plain_english_insight: string;
  distractor_summary: string;
  option_breakdown: Array<{
    option: string;
    overall_pct: number;
    upper_pct: number;
    lower_pct: number;
    is_correct_key: boolean;
  }>;
}

export function ItemAnalysisTable({ items }: { items: ItemAnalysisData[] }) {
  const [expandedItem, setExpandedItem] = useState<number | null>(7); // Default expand Q7 anomaly

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Classical Item Analysis & Psychometrics</h3>
          <p className="text-xs text-slate-500">
            Computed deterministically using Kelley’s 27% rule ($D = p_U - p_L$) and difficulty index ($p = R/N$).
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Investigate Key</span>
          </span>
          <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Functioning</span>
          </span>
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
            {items.map((item) => {
              const isAnomaly = Boolean(item.anomaly_flag);
              const isExpanded = expandedItem === item.item_number;

              return (
                <React.Fragment key={item.item_number}>
                  <tr
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isAnomaly ? "bg-amber-50/50" : ""
                    }`}
                    onClick={() => setExpandedItem(isExpanded ? null : item.item_number)}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">#{item.item_number}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">{item.topic_tag}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-center leading-6 text-xs">
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
                            ? "bg-rose-600 text-white animate-pulse"
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
                      {isAnomaly ? (
                        <div className="flex items-center space-x-1.5 text-rose-700 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{item.anomaly_flag?.replace("_", " ")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Valid</span>
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
                            <p className="font-semibold text-slate-900 mb-1">Pedagogical Anomaly Report:</p>
                            <p>{item.plain_english_insight}</p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                              Distractor Analysis (Option Selections by Upper vs Lower 27% Groups):
                            </p>
                            <div className="grid grid-cols-4 gap-2">
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
                                    <span className="font-bold text-slate-900">
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
                                    <p>Top 27%: {(opt.upper_pct * 100).toFixed(0)}%</p>
                                    <p>Bottom 27%: {(opt.lower_pct * 100).toFixed(0)}%</p>
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

