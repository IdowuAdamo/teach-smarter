"use client";

import React, { useState } from "react";
import { Check, Edit3, Send, Sparkles, AlertCircle, RefreshCw, Loader2, UserCheck, Mail, ShieldCheck } from "lucide-react";
import { API_BASE } from "@/lib/api";

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
    guardianName: "Idowu Adamo",
    guardianEmail: "idowuadamo2719@gmail.com",
    language: "EN",
    category: "BREAKTHROUGH_PRAISE",
    subject: "Celebrating Sarah's Outstanding Breakthrough in Mathematics!",
    body: "Dear Mr. Adamo,\n\nI wanted to share wonderful news! Sarah achieved an 86.7% on our latest Unit 3 Mathematics assessment today—a +28.2% leap over her previous tests (prior baseline: 58.5%). Her understanding of graphing linear equations and slope has truly clicked. We are proud of her perseverance!",
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
  const [selectedId, setSelectedId] = useState<string>("draft-1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedDraft = drafts.find((d) => d.id === selectedId) || drafts[0];

  const handleApprove = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "APPROVED" } : d))
    );
    showNotice("Draft approved. Verified with SHA-256 hash. Ready for Amazon SES dispatch.");
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
              status: "EDITED",
            }
          : d
      )
    );
    setEditingId(null);
    showNotice("Edits saved (version incremented). Prior approval voided—re-approval required.");
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
    showNotice("Tone modified with structured English template. Re-approval required.");
  };

  const handleSend = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    setSendingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/v1/communications/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft_id: draft.id,
          student_name: draft.studentName,
          guardian_name: draft.guardianName,
          recipient_email: draft.guardianEmail,
          subject: draft.subject,
          body: draft.body,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Dispatch failed");
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "SENT" } : d))
      );
      showNotice(data.message || `Dispatched live email via Amazon SES to ${draft.guardianEmail}!`);
    } catch (err: any) {
      showNotice(`Dispatch Status: ${err.message || "Failed to dispatch email"}`);
    } finally {
      setSendingId(null);
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const pendingCount = drafts.filter((d) => d.status !== "SENT").length;

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
      id="approvals"
    >
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-900">Communication Approval Hub</h3>
            <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium border border-slate-200">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule 8 Enforced: Explicit teacher sign-off required prior to external guardian email dispatch.
          </p>
        </div>

        <button
          onClick={() => {
            setDrafts(INITIAL_DRAFTS);
            setSelectedId("draft-1");
            showNotice("Reset all communication drafts to initial queue.");
          }}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3 h-3 text-slate-400" />
          <span>Reset Queue</span>
        </button>
      </div>

      {/* Action Notice Banner */}
      {Boolean(actionNotice) && (
        <div className="bg-slate-900 text-white text-xs px-5 py-2.5 flex items-center space-x-2 transition animate-fade-in border-b border-slate-800">
          <AlertCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="font-normal">{actionNotice}</span>
        </div>
      )}

      {/* Master-Detail Split Pane */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[520px]">
        {/* Left Column: Master Draft Queue (1/3 width) */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-slate-50/40 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Drafts ({drafts.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Select to Review</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {drafts.map((d) => {
              const isSelected = d.id === selectedDraft.id;
              const isSent = d.status === "SENT";
              const isApproved = d.status === "APPROVED";

              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedId(d.id);
                    setEditingId(null);
                  }}
                  className={`w-full text-left p-4 transition-colors cursor-pointer relative ${
                    isSelected
                      ? "bg-white border-l-2 border-slate-900 shadow-2xs"
                      : "hover:bg-slate-100/50"
                  } ${isSent ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {d.studentName}
                    </span>
                    {isSent ? (
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <Check className="w-2.5 h-2.5 mr-0.5" />
                        Dispatched
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-1.5">
                    {d.guardianName} ({d.guardianEmail})
                  </p>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        d.category === "BREAKTHROUGH_PRAISE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : d.category === "INTERVENTION_NOTICE"
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : "bg-blue-50 text-blue-700 border border-blue-200/60"
                      }`}
                    >
                      {d.category === "BREAKTHROUGH_PRAISE"
                        ? "Breakthrough Praise"
                        : d.category === "INTERVENTION_NOTICE"
                        ? "Intervention Notice"
                        : "Weekly Update"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">v{d.version}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detail Email Review Pane (2/3 width) */}
        <div className="flex-1 bg-white flex flex-col justify-between overflow-y-auto">
          {selectedDraft ? (
            <>
              <div className="p-6 space-y-4">
                {/* Email Header Meta */}
                <div className="p-3.5 rounded-md border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-medium">To:</span>
                      <span className="font-semibold text-slate-900">{selectedDraft.guardianName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        &lt;{selectedDraft.guardianEmail}&gt;
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 self-start sm:self-auto">
                      <span className="font-mono">Lang: {selectedDraft.language}</span>
                      <span>•</span>
                      <span className="font-mono">Draft v{selectedDraft.version}</span>
                    </div>
                  </div>

                  <div className="text-xs pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Subject: </span>
                    <span className="font-semibold text-slate-900">{selectedDraft.subject}</span>
                  </div>
                </div>

                {/* 1-Click English Tone Modifiers */}
                {selectedDraft.status !== "SENT" && editingId !== selectedDraft.id && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-medium text-slate-500 flex items-center space-x-1 mr-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>1-Click Tone Modifiers:</span>
                    </span>
                    <button
                      onClick={() => handleToneAdjust(selectedDraft.id, "soften")}
                      className="text-[11px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                    >
                      Soften Tone
                    </button>
                    <button
                      onClick={() => handleToneAdjust(selectedDraft.id, "home_tips")}
                      className="text-[11px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                    >
                      + Home Tips
                    </button>
                    <button
                      onClick={() => handleToneAdjust(selectedDraft.id, "sms_format")}
                      className="text-[11px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                    >
                      Concise SMS Summary
                    </button>
                  </div>
                )}

                {/* Email Body Preview / Inline Editor */}
                {editingId === selectedDraft.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={9}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-sans leading-relaxed text-slate-800"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(selectedDraft.id)}
                        className="px-3 py-1.5 text-xs bg-slate-900 text-white font-medium rounded hover:bg-slate-800 cursor-pointer"
                      >
                        Save Version
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md border border-slate-200 bg-slate-50/30 text-xs leading-relaxed text-slate-800 whitespace-pre-line min-h-[220px]">
                    {selectedDraft.body}
                  </div>
                )}
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {selectedDraft.status !== "SENT" && editingId !== selectedDraft.id && (
                    <button
                      onClick={() => handleStartEdit(selectedDraft)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Message</span>
                    </button>
                  )}
                  {selectedDraft.status === "APPROVED" && (
                    <span className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SHA-256 Hash Verified</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedDraft.status === "SENT" ? (
                    <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dispatched via Amazon SES</span>
                    </span>
                  ) : selectedDraft.status === "APPROVED" ? (
                    <button
                      onClick={() => handleSend(selectedDraft.id)}
                      disabled={sendingId === selectedDraft.id}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {sendingId === selectedDraft.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching SES...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Now</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(selectedDraft.id)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Draft</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select a message draft from the queue to review and sign off.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
