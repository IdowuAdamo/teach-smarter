"use client";

import React, { useState } from "react";
import { Check, Edit3, Send, Sparkles, Globe, AlertCircle, RefreshCw } from "lucide-react";

export type AnswerOption = "A" | "B" | "C" | "D";
export type LocaleCode = "EN";

export interface DraftMessage {
  id: string;
  studentName: string;
  guardianName: string;
  guardianEmail: string;
  language: LocaleCode;
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
    guardianName: "Mrs. Patricia Jenkins",
    guardianEmail: "patricia.j@example.ng",
    language: "EN",
    category: "BREAKTHROUGH_PRAISE",
    subject: "Celebrating Sarah's Outstanding Breakthrough in Mathematics!",
    body: "Dear Mrs. Jenkins,\n\nI wanted to share wonderful news! Sarah achieved an 86.7% on our latest Unit 3 Mathematics assessment today—a +28.2% leap over her previous tests (prior baseline: 58.5%). Her understanding of graphing linear equations and slope has truly clicked. We are proud of her perseverance!",
    version: 1,
    status: "PENDING",
  },
  {
    id: "draft-2",
    studentName: "Marcus Vance",
    guardianName: "Mrs. Angela Vance",
    guardianEmail: "angela.vance@example.ng",
    language: "EN",
    category: "INTERVENTION_NOTICE",
    subject: "Update on Marcus: Unit 3 Negative Exponents Support",
    body: "Dear Mrs. Vance,\n\nMarcus continues to be a thoughtful and engaged student in class. On our recent Unit 3 assessment, he scored 73.3% (down -15.7% from his usual 89.0% baseline). His work indicates a specific concept gap in negative exponents, though his linear algebra foundation remains solid. We have arranged targeted 15-minute review sessions next week.",
    version: 1,
    status: "PENDING",
  },
  {
    id: "draft-3",
    studentName: "Babatunde Adeyemi",
    guardianName: "Mrs. Funke Adeyemi",
    guardianEmail: "funke.adeyemi@example.ng",
    language: "EN",
    category: "WEEKLY_UPDATE",
    subject: "Academic Progress Update: Babatunde in JSS 2 Mathematics",
    body: "Dear Mrs. Adeyemi,\n\nI am writing to share an update on Babatunde's steady academic progress in JSS 2 Mathematics. He achieved 73.3% on our recent Unit 3 assessment, demonstrating solid mastery of linear equations. We will continue reinforcing negative exponents and scientific notation over the coming weeks.",
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
              status: "EDITED", // Invalidate prior approval
            }
          : d
      )
    );
    setEditingId(null);
    showNotice("Edits saved. Prior approval voided—re-approval required before sending.");
  };

  const handleToneAdjust = (id: string, modifier: "soften" | "home_tips" | "sms_format") => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        let newBody = d.body;

        if (modifier === "soften") {
          newBody = d.body.replace(
            "down -15.7% from his usual 89.0% baseline",
            "a temporary dip while tackling challenging new algebra and exponent concepts"
          );
        } else if (modifier === "home_tips") {
          newBody +=
            "\n\nRecommended Home Practice Tip: Spend 10 minutes practicing exponent inversion rules (e.g., 5^-2 = 1/25) with exercises from New General Mathematics for JSS Book 2 Chapter 4.";
        } else if (modifier === "sms_format") {
          if (d.id === "draft-1") {
            newBody =
              "Greenwood Academy: Great news! Sarah Jenkins achieved 86.7% in JSS 2 Math Unit 3 (+28.2% leap). Outstanding breakthrough in linear graphing.";
          } else if (d.id === "draft-2") {
            newBody =
              "Greenwood Academy: Marcus Vance scored 73.3% on JSS 2 Math Unit 3. Targeted 15-min remedial review on negative exponents scheduled next week.";
          } else if (d.id === "draft-3") {
            newBody =
              "Greenwood Academy: Babatunde Adeyemi scored 73.3% on JSS 2 Math Unit 3, demonstrating solid mastery of linear equations.";
          }
        }
        return {
          ...d,
          body: newBody,
          version: d.version + 1,
          status: "EDITED",
        };
      })
    );
    showNotice("Tone modified with structured English prompt. Prior approval voided—re-approval required.");
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

  const pendingCount = drafts.filter((d) => d.status !== "SENT").length;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      id="approvals"
    >
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <span>Human-in-the-Loop Communication Approval Hub</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingCount} Pending Review
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule 8 Enforced: Zero automated communications sent without verified teacher sign-off. Any edit invalidates previous approval.
          </p>
        </div>

        <button
          onClick={() => {
            setDrafts(INITIAL_DRAFTS);
            showNotice("Reset all communication drafts to initial queue.");
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Queue</span>
        </button>
      </div>

      {Boolean(actionNotice) && (
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
                    <span
                      translate="no"
                      className="notranslate uppercase font-semibold text-slate-700"
                    >
                      {draft.language}
                    </span>
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
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(draft.id)}
                        className="px-3 py-1 text-xs bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 cursor-pointer"
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

                {/* 1-Click English Tone Modifiers */}
                {!isSent && !isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>1-Click Tone Modifiers (English):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleToneAdjust(draft.id, "soften")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        Soften Tone
                      </button>
                      <button
                        onClick={() => handleToneAdjust(draft.id, "home_tips")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        + Home Tips
                      </button>
                      <button
                        onClick={() => handleToneAdjust(draft.id, "sms_format")}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        Concise SMS Summary
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
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
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
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(draft.id)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
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
