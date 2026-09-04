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

  const provider = draft?.provider ?? settings.provider;
  const apiKeyField = provider === "anthropic" ? "anthropicApiKey" : "openaiApiKey";

  // Initialize the draft once on load only. Re-syncing on every `settings`
  // change would clobber unsaved draft edits (e.g. a provider switch) the
  // moment saveApiKey() persists just the key field.
  useEffect(() => {
    if (loaded && !draft) {
      setDraft(settings);
    }
  }, [loaded, settings, draft]);

  // Swap the visible key input whenever the provider changes, so switching
  // providers doesn't show one provider's key with the other's label.
  useEffect(() => {
    if (loaded) setApiKeyInput(settings[apiKeyField]);
  }, [loaded, settings, apiKeyField]);

  if (!loaded || !draft) return null;

  const update = (patch: Partial<Settings>) => setDraft((d) => ({ ...d!, ...patch }));

  const switchProvider = (next: Settings["provider"]) => {
    update({ provider: next });
    setApiKeyInput(settings[next === "anthropic" ? "anthropicApiKey" : "openaiApiKey"]);
  };

  const saveApiKey = () => {
    const patch = { [apiKeyField]: apiKeyInput } as Partial<Settings>;
    save(patch);
    // Keep draft's copy of the key in sync too - otherwise a later "Save
    // Changes" click does save(draft) with the draft's stale (pre-edit) key
    // value and silently overwrites what was just saved here.
    update(patch);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const saveSettings = () => {
    save(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasKey = !!settings[apiKeyField];

  return (
    <div className="px-8 py-8 max-w-xl w-full">
      <h1 className="text-xl font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>Settings</h1>
      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>Configure your Para AI preferences.</p>

      {/* Provider */}
      <Section
        title="AI Provider"
        description="Choose which API powers Assistant and Research."
      >
        <div className="space-y-1">
          <RadioOption
            name="provider"
            value="anthropic"
            current={draft.provider}
            label="Anthropic Claude"
            description="Claude Sonnet 4.6 / Opus 4.8."
            onChange={(v) => switchProvider(v as Settings["provider"])}
          />
          <RadioOption
            name="provider"
            value="openai"
            current={draft.provider}
            label="OpenAI"
            description="GPT-4o / GPT-4o mini."
            onChange={(v) => switchProvider(v as Settings["provider"])}
          />
        </div>
      </Section>

      {/* API Key */}
      <Section
        title={provider === "anthropic" ? "Anthropic API Key" : "OpenAI API Key"}
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
              placeholder={provider === "anthropic" ? "sk-ant-..." : "sk-..."}
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
        {provider === "anthropic" ? (
          <div className="space-y-1">
            <RadioOption
              name="model"
              value="claude-sonnet-4-6"
              current={draft.anthropicModel}
              label="Claude Sonnet 4.6"
              description="Fast and capable — recommended for most tasks."
              onChange={(v) => update({ anthropicModel: v as Settings["anthropicModel"] })}
            />
            <RadioOption
              name="model"
              value="claude-opus-4-8"
              current={draft.anthropicModel}
              label="Claude Opus 4.8"
              description="Most capable — better for complex legal reasoning, slower and more expensive."
              onChange={(v) => update({ anthropicModel: v as Settings["anthropicModel"] })}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <RadioOption
              name="model"
              value="gpt-4o"
              current={draft.openaiModel}
              label="GPT-4o"
              description="Fast and capable — recommended for most tasks."
              onChange={(v) => update({ openaiModel: v as Settings["openaiModel"] })}
            />
            <RadioOption
              name="model"
              value="gpt-4o-mini"
              current={draft.openaiModel}
              label="GPT-4o mini"
              description="Cheaper and faster, lower reasoning quality."
              onChange={(v) => update({ openaiModel: v as Settings["openaiModel"] })}
            />
          </div>
        )}
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
