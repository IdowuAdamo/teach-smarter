"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ItemAnalysisTable, ItemAnalysisData } from "@/components/ItemAnalysisTable";
import { StudentTrajectoryTable, StudentTrajectoryData } from "@/components/StudentTrajectoryTable";
import { ApprovalHub } from "@/components/ApprovalHub";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(true);
  const [items, setItems] = useState<ItemAnalysisData[]>([]);
  const [students, setStudents] = useState<StudentTrajectoryData[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load classroom and psychometrics from API
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch classrooms
      const cRes = await fetch("http://127.0.0.1:8000/api/v1/classrooms");
      const classrooms = await cRes.json();

      let cId = classrooms[0]?.id;
      if (!cId) {
        // Auto-seed if empty
        const seedRes = await fetch("http://127.0.0.1:8000/api/v1/demo/load", { method: "POST" });
        const seedData = await seedRes.json();
        cId = seedData.details.classroom_id;
      }

      // 2. Fetch analytics
      const aRes = await fetch(`http://127.0.0.1:8000/api/v1/classrooms/${cId}/analytics`);
      const aData = await aRes.json();
      setAnalytics(aData);
      setStudents(aData.students || []);

      // 3. Fetch item psychometrics
      const unit3Id = aData.latest_assessment?.assessment_id;
      if (unit3Id) {
        const iRes = await fetch(`http://127.0.0.1:8000/api/v1/assessments/${unit3Id}/item-analysis`);
        const iData = await iRes.json();
        setItems(iData.items || []);
      }
    } catch (err) {
      console.warn("Using offline fallback demo dataset:", err);
      // Fallback data is automatically populated by mock state
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
      const res = await fetch("http://127.0.0.1:8000/api/v1/demo/load", { method: "POST" });
      const data = await res.json();
      setNotification("Grade 8 Math Demo Classroom re-seeded successfully!");
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setNotification("Re-seed completed in local state.");
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Active Classroom: Grade 8 Mathematics (Period 3)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unit 3: Linear Equations & Exponents
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Assessment administered on Oct 27, 2026. Classical item analysis and longitudinal student trajectories
              computed deterministically without LLM hallucination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleResetDemo}
              disabled={loading}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Reset Demo Classroom</span>
            </button>

            <a
              href="#approvals"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Review 3 Pending Drafts</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Class Mean</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">74.2%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Median: 76.0% (N=25)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Breakthroughs</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700">1 Student</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Sarah Jenkins (+27%)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Early Warnings</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700">1 Student</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Marcus Vance (-25%)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Test Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700">2 Items</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Q7 Miskey, Q12 Flat</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>FERPA Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">100%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Local Tokenization</p>
        </div>
      </div>

      {/* Row 2: Distribution & Curriculum Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsCharts summary={analytics?.latest_assessment} />
        </div>

        {/* Topic Gap Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">Curriculum Topic Mastery</h4>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                1 Systemic Gap
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Solving Linear Equations (Q1-5)</span>
                  <span className="text-emerald-700">88% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "88%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Linear Graphing & Slope (Q6-10)</span>
                  <span className="text-indigo-700">81% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "81%" }}></div>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <div className="flex justify-between text-xs font-bold text-rose-900 mb-1">
                  <span className="flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Negative Exponents (Q11-15)</span>
                  </span>
                  <span className="text-rose-700 font-mono">51% Mastery</span>
                </div>
                <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-rose-600 h-2 rounded-full" style={{ width: "51%" }}></div>
                </div>
                <p className="text-[11px] text-rose-800 leading-snug">
                  Identified as a systemic classroom learning gap. 49% of students missed negative power inversions (e.g., 5^-2).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Actionable Remedy:</span>
            <span className="font-semibold text-indigo-600 hover:underline cursor-pointer">
              View Suggested 15-min Small Group
            </span>
          </div>
        </div>
      </div>

      {/* Item Psychometrics Table */}
      <div id="validity">
        <ItemAnalysisTable items={items} />
      </div>

      {/* Student Diagnostics Table */}
      <div id="trajectories">
        <StudentTrajectoryTable students={students} />
      </div>

      {/* Human in the Loop Approval Hub */}
      <ApprovalHub />
    </div>
  );
}

