"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { SiteSettings } from "@/app/lib/api/settings";

const SettingsContext = createContext<SiteSettings | null>(null);

export const SettingsProvider = ({
  children,
  settings,
}: {
  children: ReactNode;
  settings: SiteSettings;
}) => {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
