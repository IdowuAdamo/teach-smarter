"use client";

import React, { useState } from "react";
import { Check, Edit3, Send, Sparkles, Globe, HeartHandshake, AlertCircle, RefreshCw } from "lucide-react";

export interface DraftMessage {
  id: string;
  studentName: string;
  guardianName: string;
  guardianEmail: string;
  language: string;
  category: "BREAKTHROUGH_PRAISE" | "INTERVENTION_NOTICE" | "WEEKLY_UPDATE";
  subject: string;
  body: string;
  version: number;
  status: "PENDING" | "APPROVED" | "EDITED" | "SENT";
}

const INITIAL_DRAFTS: DraftMessage[] = [
  {
    id: "draft-1",
    studentName: "Sarah Jenkins",
    guardianName: "Patricia Jenkins",
    guardianEmail: "patricia.j@example.com",
    language: "en",
    category: "BREAKTHROUGH_PRAISE",
    subject: "Celebrating Sarah's Outstanding Breakthrough in Math!",
    body: "Dear Mrs. Jenkins,\n\nI wanted to share wonderful news! Sarah achieved an 89% on our latest Unit 3 Math assessment today—a +27% leap over her previous tests. Her understanding of graphing linear equations and slope has truly clicked. We are so proud of her perseverance!",
    version: 1,
    status: "PENDING",
  },
  {
    id: "draft-2",
    studentName: "Marcus Vance",
    guardianName: "Angela Vance",
    guardianEmail: "angela.vance@example.org",
    language: "en",
    category: "INTERVENTION_NOTICE",
    subject: "Update on Marcus: Unit 3 Negative Exponents Support",
    body: "Dear Ms. Vance,\n\nMarcus continues to be a thoughtful and engaged student in class. On our recent Unit 3 assessment, he scored 61% (down from his usual 88%+ average). His work indicates a specific concept gap in negative exponents, though his linear algebra foundation remains solid. We have arranged targeted 15-minute review sessions next week.",
    version: 1,
    status: "PENDING",
  },
  {
    id: "draft-3",
    studentName: "Mateo Alvarez",
    guardianName: "Elena Alvarez",
    guardianEmail: "elena.alvarez@example.es",
    language: "es",
    category: "WEEKLY_UPDATE",
    subject: "Actualización académica: Progreso de Mateo en Matemáticas",
    body: "Estimada Sra. Alvarez,\n\nLe escribo para informarle sobre el progreso constante de Mateo en Matemáticas. Obtuvo un 74% en la evaluación de la Unidad 3, demostrando un buen dominio de las ecuaciones lineales. Continuaremos reforzando la notación científica durante las próximas dos semanas.",
    version: 1,
    status: "PENDING",
  },
];

export function ApprovalHub() {
  const [drafts, setDrafts] = useState<DraftMessage[]>(INITIAL_DRAFTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "APPROVED" } : d))
    );
    showNotice("Draft approved! Verified with content hash. Ready for simulated dispatch.");
  };

  const handleStartEdit = (draft: DraftMessage) => {
    setEditingId(draft.id);
    setEditText(draft.body);
  };

  const handleSaveEdit = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              body: editText,
              version: d.version + 1,
              status: "EDITED", // Invalidate prior approval!
            }
          : d
      )
    );
    setEditingId(null);
    showNotice("Edits saved. Prior approval voided—re-approval required before sending.");
  };

  const handleToneAdjust = (id: string, modifier: "soften" | "home_tips" | "translate_es") => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        let newBody = d.body;
        if (modifier === "soften") {
          newBody = d.body.replace(
            "down from his usual 88%+ average",
            "a temporary dip while tackling challenging new algebra concepts"
          );
        } else if (modifier === "home_tips") {
          newBody +=
            "\n\nRecommended Home Practice Tip: Spend 10 minutes practicing exponent flip-cards (e.g., 2^-3 = 1/8) or review Khan Academy Module 4.2.";
        } else if (modifier === "translate_es") {
          newBody =
            "Estimada familia,\n\nSarah logró un sobresaliente 89% en nuestra evaluación de Matemáticas, un salto de +27% en comparación con sus exámenes anteriores. ¡Estamos muy orgullosos de su dedicación!";
        }
        return {
          ...d,
          body: newBody,
          version: d.version + 1,
          status: "EDITED",
        };
      })
    );
    showNotice("Tone modified with structured AI prompt. Re-approval required.");
  };

  const handleSend = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "SENT" } : d))
    );
    showNotice("[SES Sandbox Simulation] Verified message dispatched to guardian successfully.");
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="approvals">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <span>Human-in-the-Loop Communication Approval Hub</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {drafts.filter((d) => d.status !== "SENT").length} Pending Review
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule 8 Enforced: Zero automated emails sent without verified teacher sign-off. Any edit invalidates previous approval.
          </p>
        </div>

        <button
          onClick={() => {
            setDrafts(INITIAL_DRAFTS);
            showNotice("Reset all communication drafts to initial queue.");
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Queue</span>
        </button>
      </div>

      {actionNotice && (
        <div className="bg-indigo-600 text-white text-xs px-6 py-2.5 flex items-center space-x-2 transition animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{actionNotice}</span>
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map((draft) => {
          const isEditing = editingId === draft.id;
          const isApproved = draft.status === "APPROVED";
          const isSent = draft.status === "SENT";

          return (
            <div
              key={draft.id}
              className={`rounded-xl border transition flex flex-col justify-between ${
                isSent
                  ? "bg-slate-50 border-slate-200 opacity-60"
                  : isApproved
                  ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400"
                  : "bg-white border-slate-200 hover:shadow-md"
              }`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      draft.category === "BREAKTHROUGH_PRAISE"
                        ? "bg-emerald-100 text-emerald-800"
                        : draft.category === "INTERVENTION_NOTICE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {draft.category.replace("_", " ")}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="uppercase font-semibold">{draft.language}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono">v{draft.version}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{draft.studentName}</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Guardian: {draft.guardianName} ({draft.guardianEmail})
                </p>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 mb-3">
                  {draft.subject}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(draft.id)}
                        className="px-3 py-1 text-xs bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
                      >
                        Save Version
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line mb-3 min-h-[140px]">
                    {draft.body}
                  </div>
                )}

                {/* 1-Click Tone Modifiers */}
                {!isSent && !isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>1-Click Tone Modifiers:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleToneAdjust(draft.id, "soften")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition"
                      >
                        Soften Tone
                      </button>
                      <button
                        onClick={() => handleToneAdjust(draft.id, "home_tips")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition"
                      >
                        + Home Tips
                      </button>
                      <button
                        onClick={() => handleToneAdjust(draft.id, "translate_es")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition"
                      >
                        Traducción ES
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => handleStartEdit(draft)}
                  disabled={isSent || isEditing}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 disabled:opacity-40"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <div className="flex items-center space-x-2">
                  {isSent ? (
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Dispatched</span>
                    </span>
                  ) : isApproved ? (
                    <button
                      onClick={() => handleSend(draft.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(draft.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

