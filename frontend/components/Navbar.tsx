"use client";

import React from "react";
import { GraduationCap, BarChart2, Sparkles, Activity, Users2, Inbox } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useTab, TabKey } from "@/context/TabContext";

export function Navbar() {
  const { activeTab, setActiveTab } = useTab();

  const navItems: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "psychometrics", label: "Psychometrics", icon: Sparkles },
    { key: "diagnostics", label: "Student Diagnostics", icon: Activity },
    { key: "strategy", label: "Teaching Strategy", icon: Users2 },
    { key: "approvals", label: "Approval Hub", icon: Inbox },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex items-center space-x-2 text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4 text-slate-100" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold tracking-tight text-slate-900">TeachSmarter</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs text-slate-500 hidden sm:inline font-normal">Greenwood Academy</span>
            </div>
          </button>

          {/* Center Navigation Tabs (Linear-inspired) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Clerk User / Auth Controls */}
        <div className="flex items-center space-x-3">
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-2.5">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-7 h-7",
                  },
                }}
              />
              <div className="hidden sm:block text-left text-xs leading-none">
                <p className="font-medium text-slate-900">Teacher Account</p>
                <p className="text-[11px] text-slate-500 mt-0.5">JSS 2 Mathematics</p>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-200 px-4 py-1.5 bg-slate-50/50 flex space-x-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
