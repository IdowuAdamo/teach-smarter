"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, Sparkles, BarChart2, Inbox, Users2, Activity } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["overview", "validity", "trajectories", "recommendations", "approvals"];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("overview")}
            className="flex items-center space-x-2 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">TeachSmarter</span>
              <span className="text-xs block text-slate-500 font-medium leading-none">AI Co-pilot with Teacher Oversight</span>
            </div>
          </button>

          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => scrollToSection("overview")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${activeSection === "overview"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => scrollToSection("validity")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${activeSection === "validity"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Psychometrics</span>
            </button>

            <button
              onClick={() => scrollToSection("trajectories")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${activeSection === "trajectories"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Student Diagnostics</span>
            </button>

            <button
              onClick={() => scrollToSection("recommendations")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${activeSection === "recommendations"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Users2 className="w-4 h-4 text-purple-500" />
              <span>Teaching Strategy</span>
            </button>

            <button
              onClick={() => scrollToSection("approvals")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 cursor-pointer ${activeSection === "approvals"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Inbox className="w-4 h-4 text-emerald-600" />
              <span>Approval Hub</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>HITL Enforced (Demo Mode)</span>
          </div>

          <SignedOut>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <SignInButton mode="modal">
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <UserButton />
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-900 leading-tight">Teacher Account</p>
                <p className="text-[11px] text-slate-500">Greenwood Academy, Lagos</p>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
