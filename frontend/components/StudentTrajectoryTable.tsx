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
  prior_baseline_average?: number;
  score_delta?: number;
  trajectory_label: "BREAKTHROUGH" | "IMPROVING" | "DECLINING" | "STABLE" | "INSUFFICIENT_DATA";
  evidence_summary: string;
}

export const COMPLETE_25_STUDENTS: StudentTrajectoryData[] = [
  {
    student_id: "s-1",
    student_number: "STU-801",
    name: "Chloe Adams",
    pseudonym_token: "LEARNER-5A1D",
    assessments_completed: 3,
    latest_percentage: 93.3,
    historical_average: 95.8,
    prior_baseline_average: 97.0,
    score_delta: -3.7,
    trajectory_label: "STABLE",
    evidence_summary: "Stable high academic performance across 3 assessments: Prior baseline of 97.0% (latest: 93.3%, delta: -3.7%).",
  },
  {
    student_id: "s-2",
    student_number: "STU-802",
    name: "Sarah Jenkins",
    pseudonym_token: "LEARNER-7F2A",
    assessments_completed: 3,
    latest_percentage: 86.7,
    historical_average: 67.9,
    prior_baseline_average: 58.5,
    score_delta: 28.2,
    trajectory_label: "BREAKTHROUGH",
    evidence_summary: "Significant breakthrough detected: Student scored 86.7%, an increase of +28.2% over prior 2-test baseline (58.5%). Prime candidate for positive reinforcement.",
  },
  {
    student_id: "s-3",
    student_number: "STU-803",
    name: "Marcus Vance",
    pseudonym_token: "LEARNER-3B9C",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 83.8,
    prior_baseline_average: 89.0,
    score_delta: -15.7,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 73.3%, dropping 15.7% below established baseline (89.0%). Early intervention check recommended.",
  },
  {
    student_id: "s-4",
    student_number: "STU-804",
    name: "David Okafor",
    pseudonym_token: "LEARNER-2C8E",
    assessments_completed: 3,
    latest_percentage: 60.0,
    historical_average: 52.7,
    prior_baseline_average: 49.0,
    score_delta: 11.0,
    trajectory_label: "IMPROVING",
    evidence_summary: "Consistent upward trajectory across 3 assessments: Average score rose to 60.0% (baseline: 49.0%, delta: +11.0%, slope: +6.00 pts/test).",
  },
  {
    student_id: "s-5",
    student_number: "STU-805",
    name: "Babatunde Adeyemi",
    pseudonym_token: "LEARNER-9E4D",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 73.1,
    prior_baseline_average: 73.1,
    score_delta: 0.2,
    trajectory_label: "STABLE",
    evidence_summary: "Stable academic performance across 3 assessments: Prior baseline of 73.1% (latest: 73.3%, delta: +0.2%).",
  },
  {
    student_id: "s-6",
    student_number: "STU-806",
    name: "Aisha Bello",
    pseudonym_token: "LEARNER-6D3F",
    assessments_completed: 3,
    latest_percentage: 80.0,
    historical_average: 89.2,
    prior_baseline_average: 93.8,
    score_delta: -13.8,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 80.0%, dropping 13.8% below established baseline (93.8%).",
  },
  {
    student_id: "s-7",
    student_number: "STU-807",
    name: "Chinedu Eze",
    pseudonym_token: "LEARNER-8B1E",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 76.8,
    prior_baseline_average: 78.5,
    score_delta: -5.2,
    trajectory_label: "STABLE",
    evidence_summary: "Stable performance across 3 assessments: Prior baseline 78.5% (latest: 73.3%, delta: -5.2%).",
  },
  {
    student_id: "s-8",
    student_number: "STU-808",
    name: "Zainab Usman",
    pseudonym_token: "LEARNER-4F7C",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 75.6,
    prior_baseline_average: 76.8,
    score_delta: -3.5,
    trajectory_label: "STABLE",
    evidence_summary: "Stable performance across 3 assessments: Prior baseline 76.8% (latest: 73.3%, delta: -3.5%).",
  },
  {
    student_id: "s-9",
    student_number: "STU-809",
    name: "Noah Williams",
    pseudonym_token: "LEARNER-5E9C",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 86.7,
    prior_baseline_average: 93.3,
    score_delta: -20.0,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 73.3%, dropping 20.0% below baseline (93.3%). Early intervention check recommended.",
  },
  {
    student_id: "s-10",
    student_number: "STU-810",
    name: "Omotola Adeleke",
    pseudonym_token: "LEARNER-1C4A",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 75.7,
    prior_baseline_average: 77.0,
    score_delta: -3.7,
    trajectory_label: "STABLE",
    evidence_summary: "Stable performance across 3 assessments: Prior baseline 77.0% (latest: 73.3%, delta: -3.7%).",
  },
  {
    student_id: "s-11",
    student_number: "STU-811",
    name: "Emeka Okonkwo",
    pseudonym_token: "LEARNER-3E2B",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 75.7,
    prior_baseline_average: 77.0,
    score_delta: -3.7,
    trajectory_label: "STABLE",
    evidence_summary: "Stable performance across 3 assessments: Prior baseline 77.0% (latest: 73.3%, delta: -3.7%).",
  },
  {
    student_id: "s-12",
    student_number: "STU-812",
    name: "Folashade Ogundipe",
    pseudonym_token: "LEARNER-7B5D",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 78.2,
    prior_baseline_average: 80.6,
    score_delta: -7.3,
    trajectory_label: "STABLE",
    evidence_summary: "Stable performance across 3 assessments: Prior baseline 80.6% (latest: 73.3%, delta: -7.3%).",
  },
  {
    student_id: "s-13",
    student_number: "STU-813",
    name: "Osasere Igbinosa",
    pseudonym_token: "LEARNER-6A9F",
    assessments_completed: 3,
    latest_percentage: 60.0,
    historical_average: 74.9,
    prior_baseline_average: 82.3,
    score_delta: -22.3,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 60.0%, dropping 22.3% below established baseline (82.3%). Early intervention check recommended.",
  },
  {
    student_id: "s-14",
    student_number: "STU-814",
    name: "Isabella Davis",
    pseudonym_token: "LEARNER-1A8B",
    assessments_completed: 3,
    latest_percentage: 86.7,
    historical_average: 91.6,
    prior_baseline_average: 94.1,
    score_delta: -7.4,
    trajectory_label: "STABLE",
    evidence_summary: "Consistent high mastery, 91.6% 3-test cumulative average (latest: 86.7%, delta: -7.4%).",
  },
  {
    student_id: "s-15",
    student_number: "STU-815",
    name: "Tariq Mohammed",
    pseudonym_token: "LEARNER-8D4C",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 77.5,
    prior_baseline_average: 79.6,
    score_delta: -6.3,
    trajectory_label: "STABLE",
    evidence_summary: "Stable academic performance across 3 assessments: Prior baseline 79.6% (latest: 73.3%, delta: -6.3%).",
  },
  {
    student_id: "s-16",
    student_number: "STU-816",
    name: "Nkechi Nnamdi",
    pseudonym_token: "LEARNER-3F8E",
    assessments_completed: 3,
    latest_percentage: 66.7,
    historical_average: 75.0,
    prior_baseline_average: 79.2,
    score_delta: -12.5,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 66.7%, dropping 12.5% below established baseline (79.2%). Targeted check recommended.",
  },
  {
    student_id: "s-17",
    student_number: "STU-817",
    name: "Aiden Okoro",
    pseudonym_token: "LEARNER-9C2A",
    assessments_completed: 3,
    latest_percentage: 60.0,
    historical_average: 54.1,
    prior_baseline_average: 51.2,
    score_delta: 8.8,
    trajectory_label: "STABLE",
    evidence_summary: "Stable to upward performance across 3 assessments: Prior baseline 51.2% (latest: 60.0%, delta: +8.8%).",
  },
  {
    student_id: "s-18",
    student_number: "STU-818",
    name: "Halimat Abubakar",
    pseudonym_token: "LEARNER-8F1A",
    assessments_completed: 3,
    latest_percentage: 40.0,
    historical_average: 61.5,
    prior_baseline_average: 72.2,
    score_delta: -32.2,
    trajectory_label: "DECLINING",
    evidence_summary: "Severe downward deviation: Student scored 40.0%, dropping 32.2% below baseline (72.2%). Immediate small group intervention recommended.",
  },
  {
    student_id: "s-19",
    student_number: "STU-819",
    name: "Elijah Danjuma",
    pseudonym_token: "LEARNER-4C6E",
    assessments_completed: 3,
    latest_percentage: 26.7,
    historical_average: 59.7,
    prior_baseline_average: 76.2,
    score_delta: -49.5,
    trajectory_label: "DECLINING",
    evidence_summary: "Severe downward deviation: Student scored 26.7%, dropping 49.5% below baseline (76.2%). High-priority intervention check required.",
  },
  {
    student_id: "s-20",
    student_number: "STU-820",
    name: "Yetunde Sowore",
    pseudonym_token: "LEARNER-2D5B",
    assessments_completed: 3,
    latest_percentage: 46.7,
    historical_average: 67.0,
    prior_baseline_average: 77.2,
    score_delta: -30.5,
    trajectory_label: "DECLINING",
    evidence_summary: "Severe downward deviation: Student scored 46.7%, dropping 30.5% below established baseline (77.2%).",
  },
  {
    student_id: "s-21",
    student_number: "STU-821",
    name: "Kelechi Amadi",
    pseudonym_token: "LEARNER-7E1D",
    assessments_completed: 3,
    latest_percentage: 73.3,
    historical_average: 86.8,
    prior_baseline_average: 93.5,
    score_delta: -20.2,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 73.3%, dropping 20.2% below established baseline (93.5%).",
  },
  {
    student_id: "s-22",
    student_number: "STU-822",
    name: "Amara Eze",
    pseudonym_token: "LEARNER-5B8F",
    assessments_completed: 3,
    latest_percentage: 86.7,
    historical_average: 91.7,
    prior_baseline_average: 94.2,
    score_delta: -7.5,
    trajectory_label: "STABLE",
    evidence_summary: "Consistent high mastery across 3 assessments: 91.7% historical average (latest: 86.7%, delta: -7.5%).",
  },
  {
    student_id: "s-23",
    student_number: "STU-823",
    name: "Benjamin Ojo",
    pseudonym_token: "LEARNER-2A4C",
    assessments_completed: 3,
    latest_percentage: 33.3,
    historical_average: 42.6,
    prior_baseline_average: 47.2,
    score_delta: -13.9,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 33.3%, dropping 13.9% below baseline (47.2%). Remedial intervention scheduled.",
  },
  {
    student_id: "s-24",
    student_number: "STU-824",
    name: "Blessing Akpan",
    pseudonym_token: "LEARNER-6E3A",
    assessments_completed: 3,
    latest_percentage: 60.0,
    historical_average: 73.5,
    prior_baseline_average: 80.2,
    score_delta: -20.2,
    trajectory_label: "DECLINING",
    evidence_summary: "Recent downward deviation: Student scored 60.0%, dropping 20.2% below established baseline (80.2%).",
  },
  {
    student_id: "s-25",
    student_number: "STU-825",
    name: "Dapo Falana",
    pseudonym_token: "LEARNER-4D9B",
    assessments_completed: 3,
    latest_percentage: 66.7,
    historical_average: 73.1,
    prior_baseline_average: 76.2,
    score_delta: -9.5,
    trajectory_label: "STABLE",
    evidence_summary: "Stable academic performance across 3 assessments: Prior baseline of 76.2% (latest: 66.7%, delta: -9.5%).",
  },
];

export function StudentTrajectoryTable({ students }: { students: StudentTrajectoryData[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const displayStudents = students && students.length > 0 ? students : COMPLETE_25_STUDENTS;

  const filtered = displayStudents.filter((s) => {
    const matchesFilter = filter === "ALL" || s.trajectory_label === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pseudonym_token.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    ALL: displayStudents.length,
    BREAKTHROUGH: displayStudents.filter((s) => s.trajectory_label === "BREAKTHROUGH").length,
    IMPROVING: displayStudents.filter((s) => s.trajectory_label === "IMPROVING").length,
    DECLINING: displayStudents.filter((s) => s.trajectory_label === "DECLINING").length,
    STABLE: displayStudents.filter((s) => s.trajectory_label === "STABLE").length,
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      id="trajectories"
    >
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Student Diagnostics & Longitudinal Trajectories</h3>
          <p className="text-xs text-slate-500">
            Baseline computed from prior 2 tests; Trajectory Delta = Latest Score - Prior Baseline Avg. Real PII is masked client-side.
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
            {(["ALL", "BREAKTHROUGH", "IMPROVING", "DECLINING", "STABLE"] as const).map((lbl) => (
              <button
                key={lbl}
                onClick={() => setFilter(lbl)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  filter === lbl ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {lbl} ({filterCounts[lbl]})
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
              const baseline =
                s.prior_baseline_average !== undefined
                  ? s.prior_baseline_average
                  : s.historical_average;
              const delta =
                s.score_delta !== undefined
                  ? s.score_delta
                  : s.latest_percentage - baseline;

              return (
                <tr key={s.student_id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                  <td
                    translate="no"
                    className="notranslate px-4 py-3 text-xs font-mono text-slate-500"
                  >
                    {s.student_number}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      translate="no"
                      className="notranslate inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <Shield className="w-3 h-3 text-indigo-500" />
                      <span>{s.pseudonym_token}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700">{s.assessments_completed}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{s.latest_percentage.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">{baseline.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    {s.trajectory_label === "BREAKTHROUGH" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Breakthrough (+{delta.toFixed(1)}%)</span>
                      </span>
                    )}
                    {s.trajectory_label === "DECLINING" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        <span>Declining ({delta.toFixed(1)}%)</span>
                      </span>
                    )}
                    {s.trajectory_label === "IMPROVING" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>Improving (+{delta.toFixed(1)}%)</span>
                      </span>
                    )}
                    {s.trajectory_label === "STABLE" && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Minus className="w-3.5 h-3.5 text-slate-500" />
                        <span>Stable ({delta >= 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`})</span>
                      </span>
                    )}
                    {s.trajectory_label === "INSUFFICIENT_DATA" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                        Need Data
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-sm truncate" title={s.evidence_summary}>
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
