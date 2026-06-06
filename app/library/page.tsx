"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface FileItem {
  filename: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function FileIcon({ type }: { type: string }) {
  const color =
    type.startsWith("image/") ? "#7c8cff" :
    type === "application/pdf" ? "#ff6b6b" :
    type.startsWith("text/") ? "#6bffb8" :
    "var(--text-muted)";

  if (type.startsWith("image/")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    );
  }
  if (type === "application/pdf") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-5h1.5"/>
        <path d="M14 18v-5"/>
        <path d="M17 13h-2v5h2"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M16 13H8M16 17H8M10 9H8"/>
    </svg>
  );
}

function PreviewModal({ file, onClose }: { file: FileItem; onClose: () => void }) {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isText = file.type.startsWith("text/") || file.type === "application/json";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#161616", borderColor: "var(--border)", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FileIcon type={file.type} />
            <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {file.name}
            </span>
            <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
              {formatSize(file.size)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <a
              href={file.url}
              download={file.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-auto">
          {isImage && (
            <div className="flex items-center justify-center p-6 min-h-64">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.url} alt={file.name} className="max-w-full max-h-[60vh] object-contain rounded" />
            </div>
          )}
          {isPdf && (
            <iframe src={file.url} className="w-full" style={{ height: "65vh" }} title={file.name} />
          )}
          {isText && <TextPreview url={file.url} />}
          {!isImage && !isPdf && !isText && (
            <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ color: "var(--text-muted)" }}>
              <FileIcon type={file.type} />
              <p className="text-sm">No preview available for this file type.</p>
              <a
                href={file.url}
                download={file.name}
                className="text-sm underline"
                style={{ color: "var(--text-primary)" }}
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    fetch(url).then((r) => r.text()).then(setText).catch(() => setText("Failed to load file."));
  }, [url]);

  if (text === null) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: "var(--text-muted)" }}>
        <span className="text-sm">Loading…</span>
      </div>
    );
  }

  return (
    <pre
      className="p-5 text-xs leading-relaxed overflow-auto whitespace-pre-wrap break-words"
      style={{ color: "var(--text-primary)", fontFamily: "monospace" }}
    >
      {text}
    </pre>
  );
}

function UploadZone({ onUploaded }: { onUploaded: (file: FileItem) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data: FileItem = await res.json();
      onUploaded(data);
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(upload);
  }, [upload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-8 py-8 transition-colors"
      style={{
        borderColor: dragging ? "var(--text-muted)" : "var(--border)",
        backgroundColor: dragging ? "var(--item-hover)" : "transparent",
      }}
    >
      <div className="rounded-full p-3" style={{ backgroundColor: "var(--item-active)" }}>
        {uploading ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {uploading ? "Uploading…" : "Drag & drop files here"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Only PDFs and text files
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-1.5 rounded-lg border text-sm transition-colors"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--item-active)" }}
        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)"}
        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-active)"}
      >
        Select File
      </button>
    </div>
  );
}

function FileRow({ file, onClick }: { file: FileItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors group"
      style={{ backgroundColor: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)"}
      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
    >
      <FileIcon type={file.type} />
      <span className="flex-1 text-sm truncate" style={{ color: "var(--text-primary)" }}>
        {file.name}
      </span>
      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
        {formatSize(file.size)}
      </span>
      <span className="text-xs shrink-0 ml-4 hidden sm:block" style={{ color: "var(--text-muted)" }}>
        {formatDate(file.uploadedAt)}
      </span>
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: "var(--text-muted)" }}
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  );
}

export default function LibraryPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then(setFiles)
      .finally(() => setLoading(false));
  }, []);

  const handleUploaded = (file: FileItem) => {
    setFiles((prev) => [file, ...prev]);
  };

  return (
    <div className="flex flex-col h-full px-8 py-8 max-w-3xl mx-auto w-full">
      <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Library</h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Upload and manage your files.
      </p>

      <UploadZone onUploaded={handleUploaded} />

      {/* File list */}
      <div className="mt-8 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading…" : `${files.length} file${files.length !== 1 ? "s" : ""}`}
          </h2>
        </div>

        {!loading && files.length === 0 && (
          <div
            className="flex items-center justify-center h-32 rounded-lg border border-dashed text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            No files uploaded yet
          </div>
        )}

        {files.length > 0 && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: "var(--border)", backgroundColor: "#111111" }}
          >
            {/* List header */}
            <div
              className="flex items-center gap-3 px-4 py-2 border-b text-xs"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <span className="w-4" />
              <span className="flex-1">Name</span>
              <span className="w-16 text-right">Size</span>
              <span className="w-24 text-right hidden sm:block">Uploaded</span>
              <span className="w-4" />
            </div>
            {files.map((file) => (
              <FileRow key={file.filename} file={file} onClick={() => setPreview(file)} />
            ))}
          </div>
        )}
      </div>

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
