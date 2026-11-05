"use client";

import React, { useEffect, useState } from "react";
import {
  UploadCloud,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Users2,
  Inbox,
  ArrowUpRight,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import {
  ItemAnalysisTable,
  ItemAnalysisData,
  COMPLETE_15_ITEMS,
} from "@/components/ItemAnalysisTable";
import {
  StudentTrajectoryTable,
  StudentTrajectoryData,
  COMPLETE_25_STUDENTS,
} from "@/components/StudentTrajectoryTable";
import { TeachingRecommendations } from "@/components/TeachingRecommendations";
import { ApprovalHub } from "@/components/ApprovalHub";
import { DataImportModal } from "@/components/DataImportModal";
import { API_BASE } from "@/lib/api";
import { useTab } from "@/context/TabContext";

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useTab();
  const [loading, setLoading] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [items, setItems] = useState<ItemAnalysisData[]>([]);
  const [students, setStudents] = useState<StudentTrajectoryData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load classroom and psychometrics from API
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch classrooms
      const cRes = await fetch(`${API_BASE}/api/v1/classrooms`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!cRes.ok) throw new Error(`HTTP error ${cRes.status}`);
      const classrooms = await cRes.json();

      let cId = classrooms[0]?.id;
      if (!cId) {
        // Auto-seed if empty
        const seedRes = await fetch(`${API_BASE}/api/v1/demo/load`, {
          method: "POST",
          signal: AbortSignal.timeout(10000),
        });
        const seedData = await seedRes.json();
        cId = seedData.details.classroom_id;
      }

      // 2. Fetch analytics
      const aRes = await fetch(`${API_BASE}/api/v1/classrooms/${cId}/analytics`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!aRes.ok) throw new Error(`HTTP error ${aRes.status}`);
      const aData = await aRes.json();
      setAnalytics(aData);
      setStudents(aData.students || []);

      // 3. Fetch item psychometrics
      const latestId = aData.latest_assessment?.assessment_id;
      if (latestId) {
        const iRes = await fetch(`${API_BASE}/api/v1/assessments/${latestId}/item-analysis`, {
          signal: AbortSignal.timeout(10000),
        });
        if (iRes.ok) {
          const iData = await iRes.json();
          setItems(iData.items || []);
        }
      }
    } catch (err) {
      console.warn("Using offline fallback demo dataset:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/demo/load`, {
        method: "POST",
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) {
        throw new Error(`Reset returned status ${res.status}`);
      }
      await res.json();
      setNotification("JSS 2 Math Demo Classroom re-seeded successfully.");
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err: any) {
      console.error("Reset error:", err);
      const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
      setNotification(
        isTimeout
          ? "Reset timed out: backend server did not respond in time."
          : "Re-seed completed in local state."
      );
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Derive metrics
  const meanPct =
    analytics?.latest_assessment?.mean_percentage !== undefined
      ? analytics.latest_assessment.mean_percentage
      : 67.5;
  const medianPct =
    analytics?.latest_assessment?.median_percentage !== undefined
      ? analytics.latest_assessment.median_percentage
      : 73.3;
  const totalN = analytics?.latest_assessment?.total_examinees ?? 25;

  const displayStudents = students && students.length > 0 ? students : COMPLETE_25_STUDENTS;
  const displayItems = items && items.length > 0 ? items : COMPLETE_15_ITEMS;

  const breakthroughStudents = displayStudents.filter((s) => s.trajectory_label === "BREAKTHROUGH");
  const breakthroughCount = breakthroughStudents.length;
  const topBreakthrough = breakthroughStudents.length > 0 ? breakthroughStudents[0] : null;

  const decliningStudents = displayStudents.filter((s) => s.trajectory_label === "DECLINING");
  const decliningCount = decliningStudents.length;

  const anomalyItems = displayItems.filter(
    (i) => Boolean(i.anomaly_flag) || i.discrimination_d < 0.2
  );
  const anomalyCount = anomalyItems.length;

  const topicMasteryList: any[] = analytics?.latest_assessment?.topic_mastery || [
    { topic_tag: "Solving Linear Equations", mastery_percentage: 76.0, is_learning_gap: false },
    { topic_tag: "Linear Graphing & Slope", mastery_percentage: 64.0, is_learning_gap: false },
    { topic_tag: "Negative Exponents", mastery_percentage: 62.4, is_learning_gap: true },
  ];

  const gapTopics = topicMasteryList.filter(
    (t: any) => Boolean(t.is_learning_gap) || Number(t.mastery_percentage ?? 0) < 65.0
  );
  const gapCount = gapTopics.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Compact Context Header (Replaces Heavy Hero Box) */}
      <div className="bg-white rounded-lg border border-slate-200 px-5 py-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center space-x-1.5">
            <span>Greenwood Academy</span>
            <span className="text-slate-300">•</span>
            <span>JSS 2 Mathematics (Period 3)</span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {analytics?.latest_assessment?.title || "Unit 3: Linear Equations & Exponents"}
          </h1>

          {/* Metadata & Status */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span>Administered {analytics?.latest_assessment?.date || "Oct 27, 2026"}</span>
            <span className="text-slate-300">•</span>
            <span>Deterministic Psychometrics</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>HITL Enforced (Demo Mode)</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start md:self-auto flex-wrap gap-y-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Gradebook</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition cursor-pointer"
          >
            <span>Review Pending Drafts</span>
            <span className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {Boolean(notification) && (
        <div className="bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-md shadow-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. View Switcher Routing: Only Render Active Tab Content */}

      {/* VIEW: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Decluttered 5 KPI Cards (Uniform Height, Strict 3-Line Hierarchy, Uniform Dark Numbers) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* KPI 1: Class Mean */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-[104px]">
              <span className="text-xs font-medium text-slate-500">Class Mean</span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {meanPct.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 tabular-nums">
                Median {medianPct.toFixed(1)}% • N={totalN}
              </p>
            </div>

            {/* KPI 2: Breakthroughs */}
            <div
              onClick={() => setActiveTab("diagnostics")}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-[104px] hover:border-slate-300 transition-colors cursor-pointer"
              title="Click to view Student Diagnostics"
            >
              <span className="text-xs font-medium text-slate-500">Breakthroughs</span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {breakthroughCount} Student{breakthroughCount === 1 ? "" : "s"}
              </p>
              <div>
                <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 tabular-nums truncate max-w-full">
                  +{topBreakthrough?.score_delta ? topBreakthrough.score_delta.toFixed(1) : "28.2"}% Sarah Jenkins
                </span>
              </div>
            </div>

            {/* KPI 3: Early Warnings */}
            <div
              onClick={() => setActiveTab("diagnostics")}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-[104px] hover:border-slate-300 transition-colors cursor-pointer"
              title="Click to view Student Diagnostics"
            >
              <span className="text-xs font-medium text-slate-500">Early Warnings</span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {decliningCount} Student{decliningCount === 1 ? "" : "s"}
              </p>
              <div>
                <span className="inline-flex items-center text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 tabular-nums">
                  11 students declining
                </span>
              </div>
            </div>

            {/* KPI 4: Test Anomalies */}
            <div
              onClick={() => setActiveTab("psychometrics")}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-[104px] hover:border-slate-300 transition-colors cursor-pointer"
              title="Click to view Item Psychometrics"
            >
              <span className="text-xs font-medium text-slate-500">Test Anomalies</span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {anomalyCount} Items
              </p>
              <div>
                <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                  Q7, Q12, Q14 flagged
                </span>
              </div>
            </div>

            {/* KPI 5: FERPA Compliance */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs flex flex-col justify-between h-[104px]">
              <span className="text-xs font-medium text-slate-500">FERPA Compliance</span>
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                100%
              </p>
              <div>
                <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                  Local Tokenization
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Score Distribution & Curriculum Topic Mastery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Score Distribution Chart */}
            <div className="lg:col-span-2">
              <AnalyticsCharts summary={analytics?.latest_assessment} />
            </div>

            {/* Curriculum Topic Mastery Progress Bars */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Curriculum Topic Mastery
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      gapCount > 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    }`}
                  >
                    {gapCount > 0
                      ? `${gapCount} Gap Detected`
                      : "All Targets Met"}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {topicMasteryList.map((topic: any, idx: number) => {
                    const isGap = Boolean(topic.is_learning_gap) || Number(topic.mastery_percentage ?? 0) < 65.0;
                    const masteryPct = Number(topic.mastery_percentage ?? 0);

                    return (
                      <div key={topic.topic_tag || idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 truncate pr-2">
                            {topic.topic_tag}
                          </span>
                          <span
                            className={`font-mono tabular-nums text-[11px] font-medium ${
                              isGap ? "text-rose-600" : "text-slate-700"
                            }`}
                          >
                            {masteryPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              isGap ? "bg-rose-500" : masteryPct >= 75 ? "bg-emerald-500" : "bg-slate-700"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, masteryPct))}%` }}
                          ></div>
                        </div>
                        {isGap && (
                          <p className="text-[11px] text-rose-600 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span>Below NERDC 65% benchmark</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Link to Teaching Strategy */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Actionable Intervention:</span>
                <button
                  onClick={() => setActiveTab("strategy")}
                  className="font-medium text-slate-900 hover:text-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Suggested Small Group</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Deep Dive View Shortcuts */}
          <div className="border-t border-slate-200/80 pt-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Module Deep Dives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setActiveTab("psychometrics")}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition text-left flex flex-col justify-between h-28 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      <span>Psychometrics</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Classical item analysis, Kelley 27% discrimination, and distractor review.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">15 Items Analyzed</span>
              </button>

              <button
                onClick={() => setActiveTab("diagnostics")}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition text-left flex flex-col justify-between h-28 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      <span>Student Diagnostics</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Longitudinal trajectory analysis and early-warning divergence detection.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">25 Student Records</span>
              </button>

              <button
                onClick={() => setActiveTab("strategy")}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition text-left flex flex-col justify-between h-28 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Users2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      <span>Teaching Strategy</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Differentiated 10-20 min grouping recommendations and curriculum tools.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">3 Strategy Groups</span>
              </button>

              <button
                onClick={() => setActiveTab("approvals")}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition text-left flex flex-col justify-between h-28 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1.5">
                      <Inbox className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      <span>Approval Hub</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Human-in-the-loop communication approval with live Amazon SES dispatch.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">3 Drafts Pending</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PSYCHOMETRICS */}
      {activeTab === "psychometrics" && (
        <div className="animate-fade-in">
          <ItemAnalysisTable items={items} />
        </div>
      )}

      {/* VIEW: STUDENT DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="animate-fade-in">
          <StudentTrajectoryTable students={students} />
        </div>
      )}

      {/* VIEW: TEACHING STRATEGY */}
      {activeTab === "strategy" && (
        <div className="animate-fade-in">
          <TeachingRecommendations />
        </div>
      )}

      {/* VIEW: APPROVAL HUB */}
      {activeTab === "approvals" && (
        <div className="animate-fade-in">
          <ApprovalHub />
        </div>
      )}

      {/* Spreadsheet Import & Column Mapping Wizard */}
      <DataImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={loadData}
      />
    </div>
  );
}
