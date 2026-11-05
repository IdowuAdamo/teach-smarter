"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TabKey = "overview" | "psychometrics" | "diagnostics" | "strategy" | "approvals";

interface TabContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const TabContext = createContext<TabContextType>({
  activeTab: "overview",
  setActiveTab: () => {},
});

export function TabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabKey>("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as TabKey;
      if (["overview", "psychometrics", "diagnostics", "strategy", "approvals"].includes(hash)) {
        setActiveTabState(hash);
      }
    }
  }, []);

  const setActiveTab = (tab: TabKey) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tab}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTab() {
  return useContext(TabContext);
}

