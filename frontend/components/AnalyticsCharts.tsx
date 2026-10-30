"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface ClassAnalyticsSummary {
  total_examinees: number;
  mean_percentage: number;
  median_percentage: number;
  distribution_bins: Record<string, number>;
}

export function AnalyticsCharts({ summary }: { summary?: ClassAnalyticsSummary }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalExaminees = summary?.total_examinees ?? 25;
  const meanPercentage = summary?.mean_percentage !== undefined ? summary.mean_percentage : 67.5;
  const medianPercentage = summary?.median_percentage !== undefined ? summary.median_percentage : 73.3;

  const bins = summary?.distribution_bins || {
    "0-49%": 4,
    "50-69%": 6,
    "70-84%": 11,
    "85-100%": 4,
  };

  const chartData = [
    { bracket: "0-49% (Intervention)", count: bins["0-49%"] ?? 4, color: "#f43f5e" },
    { bracket: "50-69% (Approaching)", count: bins["50-69%"] ?? 6, color: "#f59e0b" },
    { bracket: "70-84% (Proficient)", count: bins["70-84%"] ?? 11, color: "#3b82f6" },
    { bracket: "85-100% (Mastery)", count: bins["85-100%"] ?? 4, color: "#10b981" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Unit 3 Score Distribution</h4>
          <p className="text-xs text-slate-500">
            N = {totalExaminees} examinees | Mean: {meanPercentage.toFixed(1)}% | Median:{" "}
            {medianPercentage.toFixed(1)}%
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>&lt;50%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>85%+</span>
          </span>
        </div>
      </div>

      <div className="h-60 w-full flex items-center justify-center">
        {!mounted ? (
          <div className="w-full h-full animate-pulse bg-slate-50 rounded-lg flex items-center justify-center text-xs text-slate-400">
            Loading score distribution...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
              <Tooltip
                formatter={(val: number) => [`${val} students`, "Count"]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
