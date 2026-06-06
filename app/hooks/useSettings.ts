"use client";

import { useState, useEffect } from "react";

export interface Settings {
  apiKey: string;
  model: "claude-sonnet-4-6" | "claude-opus-4-8";
  citationFormat: "Bluebook" | "ALWD" | "California";
  systemPrompt: string;
}

const DEFAULTS: Settings = {
  apiKey: "",
  model: "claude-sonnet-4-6",
  citationFormat: "Bluebook",
  systemPrompt: "You are a helpful legal AI assistant. Be precise, cite sources where possible, and use proper legal terminology.",
};

const KEY = "para-ai-settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const save = (next: Partial<Settings>) => {
    const updated = { ...settings, ...next };
    setSettings(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  return { settings, save, loaded };
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULTS;
}
