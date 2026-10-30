"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Shield, Zap, Search } from "lucide-react";

export interface StudentTrajectoryData {
  student_id: string;
  student_number: string;
  name: string;
  pseudonym_token: string;
  assessments_completed: number;
  latest_percentage: number;
  historical_average: number;
  trajectory_label: string;
  evidence_summary: string;
}

export function StudentTrajectoryTable({ students }: { students: StudentTrajectoryData[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filtered = students.filter((s) => {
    const matchesFilter = filter === "ALL" || s.trajectory_label === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pseudonym_token.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Student Diagnostics & Longitudinal Trajectories</h3>
          <p className="text-xs text-slate-500">
            Minimum 3 historical assessments required before assigning trends. Real PII is masked client-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or pseudonym..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
            />
          </div>

          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white text-xs font-medium">
            {["ALL", "BREAKTHROUGH", "DECLINING", "STABLE"].map((lbl) => (
              <button
                key={lbl}
                onClick={() => setFilter(lbl)}
                className={`px-2.5 py-1 rounded-md transition ${
                  filter === lbl ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">FERPA Masked Token</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3">Latest Score</th>
              <th className="px-4 py-3">Baseline Avg</th>
              <th className="px-4 py-3">Trajectory</th>
              <th className="px-4 py-3">Evidence Diagnostic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((s) => {
              const delta = s.latest_percentage - s.historical_average;

              return (
                <tr key={s.student_id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">{s.student_number}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
                      <Shield className="w-3 h-3 text-indigo-500" />
                      <span>{s.pseudonym_token}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{s.assessments_completed}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{s.latest_percentage}%</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{s.historical_average}%</td>
                  <td className="px-4 py-3">
                    {s.trajectory_label === "BREAKTHROUGH" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Breakthrough (+{delta.toFixed(0)}%)</span>
                      </span>
                    )}
                    {s.trajectory_label === "DECLINING" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        <span>Declining ({delta.toFixed(0)}%)</span>
                      </span>
                    )}
                    {s.trajectory_label === "IMPROVING" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>Improving</span>
                      </span>
                    )}
                    {s.trajectory_label === "STABLE" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Minus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Stable</span>
                      </span>
                    )}
                    {s.trajectory_label === "INSUFFICIENT_DATA" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                        Need Data
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate" title={s.evidence_summary}>
                    {s.evidence_summary}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

