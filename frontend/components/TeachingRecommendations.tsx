"use client";

import React, { useState } from "react";
import { Check, Clock, Target, ArrowRight, BookOpen, Layers } from "lucide-react";

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
  const [activeFilter, setActiveFilter] = useState<"all" | "remedial" | "peer" | "extension">("all");
  const [acceptedGroups, setAcceptedGroups] = useState<string[]>([]);

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
    if (activeFilter === "remedial") return grp.group_type === "REMEDIAL_SMALL_GROUP";
    if (activeFilter === "peer") return grp.group_type === "PEER_TUTORING_PAIR";
    if (activeFilter === "extension") return grp.group_type === "EXTENSION_CHALLENGE";
    return true;
  });

  return (
    <div
      className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
      id="recommendations"
    >
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Teaching Strategy & Differentiated Groupings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic small-group synthesis from assessment psychometrics and longitudinal evidence.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeFilter === "all"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Strategies ({sampleGroupings.length})
          </button>
          <button
            onClick={() => setActiveFilter("remedial")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeFilter === "remedial"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Remedial (1)
          </button>
          <button
            onClick={() => setActiveFilter("peer")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeFilter === "peer"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Peer Tutoring (1)
          </button>
          <button
            onClick={() => setActiveFilter("extension")}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              activeFilter === "extension"
                ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Extension (1)
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Balanced 3-Column Grid with Equal Height Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredGroupings.map((grp) => {
            const isAccepted = acceptedGroups.includes(grp.group_name);
            const isRemedial = grp.group_type === "REMEDIAL_SMALL_GROUP";
            const isPeer = grp.group_type === "PEER_TUTORING_PAIR";

            return (
              <div
                key={grp.id}
                className={`rounded-lg border p-4.5 transition-all flex flex-col justify-between h-full ${
                  isAccepted
                    ? "bg-slate-50/70 border-slate-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isRemedial
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : isPeer
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      }`}
                    >
                      {isRemedial ? "Remedial Group" : isPeer ? "Peer Tutoring" : "Extension Challenge"}
                    </span>
                    <span className="flex items-center text-xs text-slate-500 font-mono tabular-nums">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {grp.recommended_duration_minutes} min
                    </span>
                  </div>

                  {/* Title & Topic */}
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{grp.group_name}</h4>
                  <p className="text-xs text-slate-500 font-medium mb-3 flex items-center space-x-1">
                    <Target className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{grp.target_topic}</span>
                  </p>

                  {/* Assigned Learners */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200/70 mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Learners ({grp.member_tokens.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {grp.member_tokens.map((m) => (
                        <span
                          key={m}
                          className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-800"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Diagnostic Rationale */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100 mb-4">
                    <span className="font-medium text-slate-800">Diagnostic Basis: </span>
                    {grp.rationale}
                  </p>
                </div>

                {/* Bottom Action Button (Aligned Horizontally) */}
                <button
                  onClick={() => handleToggleAccept(grp.group_name)}
                  className={`w-full py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                    isAccepted
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  {isAccepted ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-200" />
                      <span>Scheduled for Next Period</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Recommendation</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Curriculum Resources */}
        {(activeFilter === "all" || activeFilter === "remedial") && (
          <div className="border-t border-slate-100 pt-5 space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Curriculum Remediation Resource</span>
            </h4>
            {sampleRemedial.map((rem) => (
              <div key={rem.title} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-semibold text-slate-900 text-xs">{rem.title}</h5>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium border border-rose-200/60">
                    Target: {rem.topic}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rem.description}</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-700">Source: {rem.resource_link_or_tool}</span>
                  <span className="text-slate-400">Targeted: {rem.target_tokens.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeFilter === "all" || activeFilter === "extension") && (
          <div className="border-t border-slate-100 pt-5 space-y-2.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Curriculum Enrichment Resource</span>
            </h4>
            {sampleExtension.map((ext) => (
              <div key={ext.title} className="p-3.5 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-semibold text-slate-900 text-xs">{ext.title}</h5>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-200/60">
                    Enrichment
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{ext.description}</p>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-medium text-slate-700">Topic: {ext.topic}</span>
                  <span className="text-slate-400">Targeted: {ext.target_tokens.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
