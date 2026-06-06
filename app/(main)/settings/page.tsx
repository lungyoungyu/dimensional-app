"use client";

import { useState, useEffect } from "react";
import { useSettings, Settings } from "../../hooks/useSettings";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="py-6 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="mb-4">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

function RadioOption({
  name, value, current, label, description, onChange,
}: {
  name: string; value: string; current: string; label: string; description?: string; onChange: (v: string) => void;
}) {
  const selected = value === current;
  return (
    <label
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
      style={{ backgroundColor: selected ? "var(--item-active)" : "transparent" }}
      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)"; }}
      onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-white shrink-0"
      />
      <div>
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>}
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const { settings, save, loaded } = useSettings();

  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (loaded) {
      setApiKeyInput(settings.apiKey);
      setDraft(settings);
    }
  }, [loaded, settings]);

  if (!loaded || !draft) return null;

  const update = (patch: Partial<Settings>) => setDraft((d) => ({ ...d!, ...patch }));

  const saveApiKey = () => {
    save({ apiKey: apiKeyInput });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const saveSettings = () => {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasKey = !!settings.apiKey;

  return (
    <div className="px-8 py-8 max-w-xl w-full">
      <h1 className="text-xl font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Settings</h1>
      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>Configure your Para AI preferences.</p>

      {/* API Key */}
      <Section
        title="Anthropic API Key"
        description="Required for Assistant and Research. Never leaves your browser except to your own server."
      >
        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--border)", backgroundColor: "#161616" }}
          >
            <input
              type={showKey ? "text" : "password"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 bg-transparent text-sm outline-none font-mono"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="shrink-0 transition-opacity opacity-40 hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              {showKey ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={saveApiKey}
            className="px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors"
            style={{ backgroundColor: "var(--item-active)", color: keySaved ? "#6bffb8" : "var(--text-primary)", border: "1px solid var(--border)" }}
          >
            {keySaved ? "Saved!" : "Save"}
          </button>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: hasKey ? "#6bffb8" : "var(--text-muted)" }}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {hasKey ? "Key saved — AI features enabled" : "No key — AI features disabled"}
          </span>
        </div>
      </Section>

      {/* Model */}
      <Section
        title="AI Model"
        description="Applies to Assistant chat and Research citations."
      >
        <div className="space-y-1">
          <RadioOption
            name="model"
            value="claude-sonnet-4-6"
            current={draft.model}
            label="Claude Sonnet 4.6"
            description="Fast and capable — recommended for most tasks."
            onChange={(v) => update({ model: v as Settings["model"] })}
          />
          <RadioOption
            name="model"
            value="claude-opus-4-8"
            current={draft.model}
            label="Claude Opus 4.8"
            description="Most capable — better for complex legal reasoning, slower and more expensive."
            onChange={(v) => update({ model: v as Settings["model"] })}
          />
        </div>
      </Section>

      {/* Citation format */}
      <Section
        title="Default Citation Format"
        description="Pre-selected format on the Research page."
      >
        <div className="space-y-1">
          <RadioOption
            name="citation"
            value="Bluebook"
            current={draft.citationFormat}
            label="Bluebook"
            description="Standard for U.S. courts, law reviews, and law firms."
            onChange={(v) => update({ citationFormat: v as Settings["citationFormat"] })}
          />
          <RadioOption
            name="citation"
            value="ALWD"
            current={draft.citationFormat}
            label="ALWD"
            description="Alternative legal citation guide, used in some law schools."
            onChange={(v) => update({ citationFormat: v as Settings["citationFormat"] })}
          />
          <RadioOption
            name="citation"
            value="California"
            current={draft.citationFormat}
            label="California Style Manual"
            description="For California state court filings and documents."
            onChange={(v) => update({ citationFormat: v as Settings["citationFormat"] })}
          />
        </div>
      </Section>

      {/* System prompt */}
      <Section
        title="Assistant Persona"
        description="Instructs the AI how to behave in the Assistant chat."
      >
        <textarea
          rows={4}
          value={draft.systemPrompt}
          onChange={(e) => update({ systemPrompt: e.target.value })}
          className="w-full rounded-lg border px-3 py-2.5 text-sm resize-none outline-none leading-relaxed"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "#161616",
            color: "var(--text-primary)",
          }}
        />
      </Section>

      {/* Save */}
      <div className="pt-6">
        <button
          onClick={saveSettings}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: "var(--text-primary)", color: "var(--content-bg)" }}
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
