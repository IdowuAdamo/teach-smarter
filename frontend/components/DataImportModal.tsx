"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, X, ArrowRight } from "lucide-react";
import { API_BASE } from "@/lib/api";

export function DataImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [inspectData, setInspectData] = useState<any>(null);
  const [assessmentTitle, setAssessmentTitle] = useState("Unit 4: Geometry, Angles & Plane Mensuration");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [answerKeys, setAnswerKeys] = useState<Record<number, string>>({});
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setLoading(true);
      setStatusMsg("Inspecting spreadsheet and matching columns deterministically...");

      // Suggest appropriate title based on filename
      const fname = selected.name.toLowerCase();
      if (fname.includes("unit4") || fname.includes("unit_4")) {
        setAssessmentTitle("Unit 4: Geometry, Angles & Plane Mensuration");
      } else if (fname.includes("unit3") || fname.includes("unit_3")) {
        setAssessmentTitle("Unit 3: Linear Equations & Exponents");
      } else {
        const clean = selected.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        setAssessmentTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
      }

      try {
        const formData = new FormData();
        formData.append("file", selected);

        const res = await fetch(`${API_BASE}/api/v1/imports/inspect`, {
          method: "POST",
          body: formData,
          signal: AbortSignal.timeout(12000),
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        setInspectData(data);

        // Pre-populate column mappings
        const initialMap: Record<string, string> = {};
        for (const col of data.column_mappings) {
          initialMap[col.detected_column] = col.suggested_target;
        }
        setMappings(initialMap);

        // Populate Answer Keys (from KEY row if detected, or standard default keys)
        const keys: Record<number, string> = {};
        const qCount = data.detected_items_count || 15;
        const defaultU4Keys: Record<number, string> = {
          1: "A", 2: "C", 3: "B", 4: "D", 5: "A",
          6: "B", 7: "D", 8: "A", 9: "C", 10: "B",
          11: "C", 12: "A", 13: "D", 14: "B", 15: "C",
        };
        for (let i = 1; i <= qCount; i++) {
          if (data.detected_answer_keys && data.detected_answer_keys[i]) {
            keys[i] = data.detected_answer_keys[i];
          } else if (fname.includes("unit4")) {
            keys[i] = defaultU4Keys[i] || "A";
          } else {
            keys[i] = "A";
          }
        }
        setAnswerKeys(keys);

        setStatusMsg(null);
      } catch (err: any) {
        const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
        setStatusMsg(
          isTimeout
            ? "Inspection Error: Request timed out. Please verify backend is running at http://127.0.0.1:8000."
            : `Inspection Error: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommit = async () => {
    if (!inspectData) return;
    setLoading(true);
    setStatusMsg("Committing records to database and computing deterministic psychometrics...");

    try {
      // Fetch classroom ID
      const cRes = await fetch(`${API_BASE}/api/v1/classrooms`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!cRes.ok) throw new Error(`Failed to fetch classroom (${cRes.status})`);
      const classrooms = await cRes.json();
      const classroomId = classrooms[0]?.id;

      if (!classroomId) {
        throw new Error("No active classroom found. Please load the demo classroom first.");
      }

      const res = await fetch(`${API_BASE}/api/v1/imports/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          classroom_id: classroomId,
          assessment_title: assessmentTitle,
          column_mappings: mappings,
          rows_data: inspectData.all_rows,
          answer_keys: answerKeys,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to commit import (${res.status})`);
      }

      const result = await res.json();
      setStatusMsg(`Success! Imported ${result.details.students_imported} student records.`);
      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 1200);
    } catch (err: any) {
      const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
      setStatusMsg(
        isTimeout
          ? "Commit Error: Request timed out connecting to http://127.0.0.1:8000."
          : `Commit Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Import Classroom Gradebook</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!inspectData ? (
            <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2.5" />
              <p className="text-sm font-medium text-slate-900 mb-1">
                Upload CSV or Excel Gradebook
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Supports Canvas, Google Classroom, and NERDC standard export formats.
              </p>
              <label className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium cursor-pointer transition shadow-xs">
                <span>Select File</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-3 font-mono">
                Tip: data/synthetic/grade8_math_unit4_gradebook.csv
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-slate-300 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-900">Column Mapping Review:</h4>
                  <span className="text-[11px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {inspectData.total_rows} Rows • {inspectData.detected_items_count} Questions
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {inspectData.column_mappings.map((col: any) => (
                    <div
                      key={col.detected_column}
                      className="flex items-center justify-between text-xs p-2 rounded-md bg-slate-50 border border-slate-200"
                    >
                      <div className="truncate max-w-[200px]">
                        <span className="font-medium text-slate-900">{col.detected_column}</span>
                        {col.sample_values?.length > 0 && (
                          <span className="text-[10px] text-slate-500 block truncate">
                            e.g. {col.sample_values.join(", ")}
                          </span>
                        )}
                      </div>

                      <select
                        value={mappings[col.detected_column] || "ignore"}
                        onChange={(e) =>
                          setMappings({ ...mappings, [col.detected_column]: e.target.value })
                        }
                        className="text-xs rounded border border-slate-300 bg-white p-1 focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="student_number">Student ID</option>
                        <option value="first_name">First Name</option>
                        <option value="last_name">Last Name</option>
                        <option value="full_name">Full Name</option>
                        <option value="item_response">Question Response</option>
                        <option value="score_total">Total Score</option>
                        <option value="guardian_name">Guardian Name</option>
                        <option value="guardian_email">Guardian Email</option>
                        <option value="language">Language</option>
                        <option value="ignore">Ignore</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Key Review / Configuration */}
              {inspectData.detected_items_count > 0 && (
                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-900">Assessment Answer Keys ({inspectData.detected_items_count} Items):</h4>
                    <span className="text-[10px] text-slate-500">Auto-detected from file</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded border border-slate-200">
                    {Array.from({ length: inspectData.detected_items_count }, (_, i) => i + 1).map((qNum) => (
                      <div key={qNum} className="flex items-center space-x-1 p-1 bg-slate-50 rounded border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-700 text-[11px] font-mono">Q{qNum}:</span>
                        <select
                          value={answerKeys[qNum] || "A"}
                          onChange={(e) => setAnswerKeys({ ...answerKeys, [qNum]: e.target.value })}
                          className="bg-white border border-slate-300 rounded font-semibold text-slate-900 text-xs px-1 py-0.5 focus:ring-1 focus:ring-slate-900 font-mono"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setInspectData(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Choose Different File
                </button>

                <button
                  onClick={handleCommit}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span>Confirm & Run Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-md flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

