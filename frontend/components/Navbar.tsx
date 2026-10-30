"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Sparkles, BarChart2, Inbox, UploadCloud } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TeachSmarter</span>
              <span className="text-xs block text-slate-500 font-medium leading-none">AI Co-pilot with Teacher Oversight</span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Overview</span>
            </Link>
            <Link
              href="#validity"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Psychometrics</span>
            </Link>
            <Link
              href="#trajectories"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <span>Student Diagnostics</span>
            </Link>
            <Link
              href="#recommendations"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <span>Teaching Strategy</span>
            </Link>
            <Link
              href="#approvals"
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1.5"
            >
              <Inbox className="w-4 h-4 text-emerald-600" />
              <span>Approval Hub</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>HITL Enforced (Demo Mode)</span>
          </div>

          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-medium">
              DT
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-900">Demo Teacher</p>
              <p className="text-slate-500">Greenwood Academy</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

