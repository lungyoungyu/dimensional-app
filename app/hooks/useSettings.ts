"use client";

import { useState, useEffect } from "react";

export type Provider = "anthropic" | "openai";
export type AnthropicModel = "claude-sonnet-4-6" | "claude-opus-4-8";
export type OpenAIModel = "gpt-4o" | "gpt-4o-mini";

export interface Settings {
  provider: Provider;
  anthropicApiKey: string;
  openaiApiKey: string;
  anthropicModel: AnthropicModel;
  openaiModel: OpenAIModel;
  citationFormat: "Bluebook" | "ALWD" | "California";
  systemPrompt: string;
}

const DEFAULTS: Settings = {
  provider: "anthropic",
  anthropicApiKey: "",
  openaiApiKey: "",
  anthropicModel: "claude-sonnet-4-6",
  openaiModel: "gpt-4o",
  citationFormat: "Bluebook",
  systemPrompt: "You are a helpful legal AI assistant. Be precise, cite sources where possible, and use proper legal terminology.",
};

const KEY = "para-ai-settings";

// Older saved settings had a single `apiKey`/`model` pair for Anthropic only.
// Fold those into the new per-provider fields so existing users don't lose
// their key when this ships.
function migrate(raw: Record<string, unknown>): Partial<Settings> {
  const migrated: Partial<Settings> = { ...raw };
  if (typeof raw.apiKey === "string" && !raw.anthropicApiKey) {
    migrated.anthropicApiKey = raw.apiKey;
  }
  if (typeof raw.model === "string" && !raw.anthropicModel) {
    migrated.anthropicModel = raw.model as AnthropicModel;
  }
  return migrated;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULTS, ...migrate(JSON.parse(raw)) });
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
    if (raw) return { ...DEFAULTS, ...migrate(JSON.parse(raw)) };
  } catch {
    // ignore
  }
  return DEFAULTS;
}
