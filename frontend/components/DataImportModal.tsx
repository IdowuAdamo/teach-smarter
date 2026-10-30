"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, X, ArrowRight } from "lucide-react";

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
  const [assessmentTitle, setAssessmentTitle] = useState("Unit 3 Math Assessment (Imported)");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setLoading(true);
      setStatusMsg("Inspecting spreadsheet and matching columns deterministically...");

      try {
        const formData = new FormData();
        formData.append("file", selected);

        const res = await fetch("http://127.0.0.1:8000/api/v1/imports/inspect", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to inspect file");
        }

        const data = await res.json();
        setInspectData(data);

        // Pre-populate column mappings
        const initialMap: Record<string, string> = {};
        for (const col of data.column_mappings) {
          initialMap[col.detected_column] = col.suggested_target;
        }
        setMappings(initialMap);
        setStatusMsg(null);
      } catch (err: any) {
        setStatusMsg(`Inspection Error: ${err.message}`);
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
      const cRes = await fetch("http://127.0.0.1:8000/api/v1/classrooms");
      const classrooms = await cRes.json();
      const classroomId = classrooms[0]?.id;

      if (!classroomId) {
        throw new Error("No active classroom found. Please load the demo classroom first.");
      }

      const res = await fetch("http://127.0.0.1:8000/api/v1/imports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroom_id: classroomId,
          assessment_title: assessmentTitle,
          column_mappings: mappings,
          rows_data: inspectData.all_rows,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to commit import");
      }

      const result = await res.json();
      setStatusMsg(`Success! Imported ${result.details.students_imported} student records.`);
      setTimeout(() => {
        onImportComplete();
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMsg(`Commit Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Import Classroom Gradebook</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!inspectData ? (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Upload CSV or Excel Gradebook
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Supports Canvas, Google Classroom, and custom spreadsheets.
              </p>
              <label className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-sm">
                <span>Select File</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-3">
                Tip: Try uploading <code>data/synthetic/grade8_math_unit3_gradebook.csv</code>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900">Deterministic Column Mapping Review:</h4>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {inspectData.total_rows} Rows | {inspectData.detected_items_count} Questions
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {inspectData.column_mappings.map((col: any) => (
                    <div
                      key={col.detected_column}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="truncate max-w-[200px]">
                        <span className="font-semibold text-slate-900">{col.detected_column}</span>
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
                        className="text-xs rounded border border-slate-300 bg-white p-1 focus:ring-1 focus:ring-indigo-500"
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

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => setInspectData(null)}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Choose Different File
                </button>

                <button
                  onClick={handleCommit}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  <span>Confirm & Run Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

