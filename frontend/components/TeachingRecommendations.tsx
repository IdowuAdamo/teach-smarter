"use client";

import React, { useState } from "react";
import { Sparkles, Check, Clock, Target, ArrowRight } from "lucide-react";

export interface GroupingData {
  id: string;
  group_name: string;
  group_type: "REMEDIAL_SMALL_GROUP" | "PEER_TUTORING_PAIR" | "EXTENSION_CHALLENGE";
  target_topic: string;
  member_tokens: string[];
  rationale: string;
  recommended_duration_minutes: number;
}

export interface RemedialData {
  topic: string;
  title: string;
  description: string;
  resource_link_or_tool: string;
  target_tokens: string[];
}

export interface ExtensionData {
  topic: string;
  title: string;
  description: string;
  target_tokens: string[];
}

export function TeachingRecommendations() {
  const [activeTab, setActiveTab] = useState<"all" | "remedial" | "peer" | "extension">("all");
  const [acceptedGroups, setAcceptedGroups] = useState<string[]>([]);

  // Synchronized roster: Marcus, David, Benjamin, Aiden in both grouping and remedial resource
  const sampleGroupings: GroupingData[] = [
    {
      id: "grp-1",
      group_name: "Negative Exponents Concept Intervention",
      group_type: "REMEDIAL_SMALL_GROUP",
      target_topic: "Negative Exponents & Scientific Notation",
      member_tokens: ["Marcus Vance", "David Okafor", "Benjamin Ojo", "Aiden Okoro"],
      rationale:
        "Diagnostic data shows Marcus scored 20% on Q11-15 (Unit 3 score: 73.3%, down -15.7% from 89.0% baseline) despite high linear algebra mastery. David, Benjamin, and Aiden struggled with exponent inversion rules (5^-2 = 1/25).",
      recommended_duration_minutes: 15,
    },
    {
      id: "grp-2",
      group_name: "Linear Slope & Graphing Peer Tutoring",
      group_type: "PEER_TUTORING_PAIR",
      target_topic: "Linear Graphing & Slope",
      member_tokens: ["Sarah Jenkins (Peer Tutor)", "Aiden Okoro"],
      rationale:
        "Sarah achieved 100% on graphing in Unit 3 (breakthrough leap +28.2% to 86.7%, baseline 58.5%). Pairing her with Aiden reinforces her confidence while helping Aiden with rise-over-run derivations.",
      recommended_duration_minutes: 12,
    },
    {
      id: "grp-3",
      group_name: "Algorithmic Systems Extension Challenge",
      group_type: "EXTENSION_CHALLENGE",
      target_topic: "Advanced Systems of Equations",
      member_tokens: ["Chloe Adams", "Isabella Davis", "Amara Eze"],
      rationale:
        "Students demonstrated 90%+ historical baseline (Chloe Adams 98.0%, Isabella Davis 94.1% baseline / 91.6% 3-test cumulative average, Amara Eze 92.5%). Recommend enrichment involving 3-variable linear systems instead of repetitive basic drill.",
      recommended_duration_minutes: 20,
    },
  ];

  const sampleRemedial: RemedialData[] = [
    {
      topic: "Negative Exponents",
      title: "Exponent Inversion Pattern Tiles",
      description:
        "Concrete hands-on card flip matching 10^2 -> 100, 10^1 -> 10, 10^0 -> 1, 10^-1 -> 1/10 to visually illustrate division patterns.",
      resource_link_or_tool: "NERDC JSS 2 Mathematics Curriculum / New General Mathematics for JSS Book 2 Chapter 4",
      target_tokens: ["Marcus Vance", "David Okafor", "Benjamin Ojo", "Aiden Okoro"],
    },
  ];

  const sampleExtension: ExtensionData[] = [
    {
      topic: "Linear Systems & Real-World Modeling",
      title: "School Business Break-Even Simulation",
      description:
        "Students model cost equations (C = 150 + 2x) vs revenue (R = 5x) for a school concession stand to calculate the exact break-even coordinate.",
      target_tokens: ["Chloe Adams", "Isabella Davis", "Amara Eze"],
    },
  ];

  const handleToggleAccept = (name: string) => {
    setAcceptedGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  };

  const filteredGroupings = sampleGroupings.filter((grp) => {
    if (activeTab === "remedial") return grp.group_type === "REMEDIAL_SMALL_GROUP";
    if (activeTab === "peer") return grp.group_type === "PEER_TUTORING_PAIR";
    if (activeTab === "extension") return grp.group_type === "EXTENSION_CHALLENGE";
    return true;
  });

  const remedialCount = sampleGroupings.filter((g) => g.group_type === "REMEDIAL_SMALL_GROUP").length;
  const peerCount = sampleGroupings.filter((g) => g.group_type === "PEER_TUTORING_PAIR").length;
  const extensionCount = sampleGroupings.filter((g) => g.group_type === "EXTENSION_CHALLENGE").length;

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      id="recommendations"
    >
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Teaching Strategy & Differentiated Groupings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated by Teaching Strategy Agent based on verified diagnostics. High-yield, 10-20 min interventions.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "all" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Strategies ({sampleGroupings.length})
          </button>
          <button
            onClick={() => setActiveTab("remedial")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "remedial" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Remedial & Small Group ({remedialCount})
          </button>
          <button
            onClick={() => setActiveTab("peer")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "peer" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Peer Tutoring ({peerCount})
          </button>
          <button
            onClick={() => setActiveTab("extension")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === "extension" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Extension Challenges ({extensionCount})
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div
          className={`grid gap-6 ${
            filteredGroupings.length === 1
              ? "grid-cols-1 max-w-xl mx-auto"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {filteredGroupings.map((grp) => {
            const isAccepted = acceptedGroups.includes(grp.group_name);

            return (
              <div
                key={grp.id}
                className={`rounded-xl border p-5 transition flex flex-col justify-between ${
                  isAccepted
                    ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-400"
                    : "bg-white border-slate-200 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        grp.group_type === "REMEDIAL_SMALL_GROUP"
                          ? "bg-rose-100 text-rose-800"
                          : grp.group_type === "PEER_TUTORING_PAIR"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {grp.group_type.replace(/_/g, " ")}
                    </span>
                    <span className="flex items-center text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {grp.recommended_duration_minutes} min
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{grp.group_name}</h4>
                  <p className="text-xs text-indigo-600 font-medium mb-3 flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{grp.target_topic}</span>
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Assigned Learners ({grp.member_tokens.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {grp.member_tokens.map((m) => (
                        <span
                          key={m}
                          className="text-xs px-2 py-0.5 rounded bg-white border border-slate-300 font-medium text-slate-800 shadow-2xs"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 mb-4">
                    <span className="font-semibold text-slate-800">Diagnostic Rationale: </span>
                    {grp.rationale}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleAccept(grp.group_name)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer ${
                    isAccepted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  {isAccepted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Scheduled for Next Period</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Recommendation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Remedial Curriculum Resource */}
        {(activeTab === "all" || activeTab === "remedial") && (
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Curriculum Remediation Resource
            </h4>
            {sampleRemedial.map((rem) => (
              <div key={rem.title} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="font-bold text-slate-900 text-xs">{rem.title}</h5>
                  <span className="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">
                    Target: {rem.topic}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{rem.description}</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="font-semibold text-indigo-600">Resource: {rem.resource_link_or_tool}</span>
                  <span>Targeted for ({rem.target_tokens.length}): {rem.target_tokens.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extension Challenge Resource */}
        {(activeTab === "all" || activeTab === "extension") && (
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High-Mastery Enrichment Resource
            </h4>
            {sampleExtension.map((ext) => (
              <div key={ext.title} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="font-bold text-slate-900 text-xs">{ext.title}</h5>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Advanced Enrichment
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{ext.description}</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="font-semibold text-emerald-700">Topic: {ext.topic}</span>
                  <span>Qualified ({ext.target_tokens.length}): {ext.target_tokens.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
