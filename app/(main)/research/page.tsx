"use client";

import { useState, useEffect } from "react";
import { getSettings } from "../../hooks/useSettings";

interface FileItem {
  filename: string;
  name: string;
  size: number;
  type: string;
}

interface CitationResult {
  filename: string;
  name: string;
  excerpt: string;
  citation: string;
}

type Format = "Bluebook" | "ALWD" | "California";

function FileIcon({ type }: { type: string }) {
  const color =
    type === "application/pdf" ? "#ff6b6b" :
    type.startsWith("text/") ? "#6bffb8" : "var(--text-muted)";
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
    </svg>
  );
}

function SourcePanel({
  files,
  selected,
  onToggle,
  onSelectAll,
  onClear,
}: {
  files: FileItem[];
  selected: Set<string>;
  onToggle: (f: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <aside
      className="flex flex-col w-[260px] shrink-0 border-r h-full overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "#0e0e0e" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Sources
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            All
          </button>
          <span style={{ color: "var(--border)" }}>|</span>
          <button
            onClick={onClear}
            className="text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 && (
          <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
            No files in Library yet.
          </p>
        )}
        {files.map((file) => {
          const checked = selected.has(file.filename);
          return (
            <label
              key={file.filename}
              className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
              style={{ backgroundColor: checked ? "var(--item-active)" : "transparent" }}
              onMouseEnter={(e) => {
                if (!checked) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
              }}
              onMouseLeave={(e) => {
                if (!checked) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(file.filename)}
                className="accent-white w-3.5 h-3.5 shrink-0"
              />
              <FileIcon type={file.type} />
              <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>
                {file.name}
              </span>
            </label>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        {selected.size} of {files.length} selected
      </div>
    </aside>
  );
}

function CitationCard({ result, format }: { result: CitationResult; format: Format }) {
  const [copied, setCopied] = useState<"excerpt" | "citation" | null>(null);

  const copy = (text: string, type: "excerpt" | "citation") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "#111111" }}
    >
      {/* Source label */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "#161616" }}
      >
        <FileIcon type="text/plain" />
        <span className="text-xs font-medium truncate" style={{ color: "var(--text-muted)" }}>
          {result.name}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Excerpt</span>
            <button
              onClick={() => copy(result.excerpt, "excerpt")}
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: copied === "excerpt" ? "#6bffb8" : "var(--text-muted)" }}
              onMouseEnter={(e) => { if (copied !== "excerpt") (e.currentTarget.style.color = "var(--text-primary)"); }}
              onMouseLeave={(e) => { if (copied !== "excerpt") (e.currentTarget.style.color = "var(--text-muted)"); }}
            >
              {copied === "excerpt" ? "Copied!" : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <blockquote
            className="text-sm leading-relaxed border-l-2 pl-3 italic"
            style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
          >
            {result.excerpt}
          </blockquote>
        </div>

        {/* Citation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{format === "California" ? "California Style Manual" : format} Citation</span>
            <button
              onClick={() => copy(result.citation, "citation")}
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: copied === "citation" ? "#6bffb8" : "var(--text-muted)" }}
              onMouseEnter={(e) => { if (copied !== "citation") (e.currentTarget.style.color = "var(--text-primary)"); }}
              onMouseLeave={(e) => { if (copied !== "citation") (e.currentTarget.style.color = "var(--text-muted)"); }}
            >
              {copied === "citation" ? "Copied!" : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <p
            className="text-sm leading-relaxed rounded-lg px-3 py-2"
            style={{ color: "var(--text-primary)", backgroundColor: "var(--item-active)", fontFamily: "monospace", fontSize: "12px" }}
          >
            {result.citation}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<Format>(() => {
    if (typeof window === "undefined") return "Bluebook";
    return getSettings().citationFormat;
  });
  const [results, setResults] = useState<CitationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data: FileItem[]) => {
        const supported = data.filter(
          (f) => f.type === "application/pdf" || f.type.startsWith("text/")
        );
        setFiles(supported);
      });
  }, []);

  const toggle = (filename: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  const search = async () => {
    if (!query.trim() || selected.size === 0 || loading) return;
    setLoading(true);
    setSearched(true);
    setResults([]);
    setSearchError(null);
    try {
      const { provider, anthropicApiKey, openaiApiKey, anthropicModel, openaiModel } = getSettings();
      const apiKey = provider === "openai" ? openaiApiKey : anthropicApiKey;
      const model = provider === "openai" ? openaiModel : anthropicModel;
      const res = await fetch("/api/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filenames: Array.from(selected), format, provider, apiKey, model }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    const all = results.map((r) => r.citation).join("\n\n");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <SourcePanel
        files={files}
        selected={selected}
        onToggle={toggle}
        onSelectAll={() => setSelected(new Set(files.map((f) => f.filename)))}
        onClear={() => setSelected(new Set())}
      />

      {/* Main panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Query bar */}
        <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <h1 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Research</h1>
          </div>
          <div className="flex gap-2">
            <div
              className="flex-1 flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)", backgroundColor: "#161616" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)", shrink: 0 }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder={selected.size === 0 ? "Select sources on the left first…" : "What are you looking for?"}
                disabled={selected.size === 0}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
            </div>

            {/* Format toggle */}
            <div
              className="flex rounded-lg border overflow-hidden shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              {(["Bluebook", "ALWD", "California"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="px-3 py-2 text-xs transition-colors"
                  style={{
                    backgroundColor: format === f ? "var(--item-active)" : "transparent",
                    color: format === f ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={search}
              disabled={!query.trim() || selected.size === 0 || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity shrink-0"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--content-bg)",
                opacity: (!query.trim() || selected.size === 0 || loading) ? 0.4 : 1,
              }}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Empty states */}
          {!searched && selected.size === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--text-muted)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <p className="text-sm mt-1">Select sources on the left to get started.</p>
            </div>
          )}
          {!searched && selected.size > 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--text-muted)" }}>
              <p className="text-sm">{selected.size} source{selected.size !== 1 ? "s" : ""} selected — enter a query above.</p>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center h-full gap-2" style={{ color: "var(--text-muted)" }}>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span className="text-sm">Searching documents…</span>
            </div>
          )}
          {searched && !loading && searchError && (
            <div className="flex items-center justify-center h-full" style={{ color: "#ff6b6b" }}>
              <p className="text-sm">{searchError}</p>
            </div>
          )}
          {searched && !loading && !searchError && results.length === 0 && (
            <div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>
              <p className="text-sm">No relevant passages found. Try a different query.</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""} · {format === "California" ? "California Style Manual" : format}
                </p>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    color: copiedAll ? "#6bffb8" : "var(--text-muted)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => { if (!copiedAll) (e.currentTarget.style.backgroundColor = "var(--item-hover)"); }}
                  onMouseLeave={(e) => { if (!copiedAll) (e.currentTarget.style.backgroundColor = "transparent"); }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  {copiedAll ? "Copied!" : "Copy all citations"}
                </button>
              </div>
              {results.map((r, i) => (
                <CitationCard key={i} result={r} format={format} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
