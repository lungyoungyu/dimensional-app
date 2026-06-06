"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const navItems = [
  {
    href: "/assistant",
    label: "Assistant",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href: "/research",
    label: "Research",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
];

function HelpModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "#161616",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Help</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 transition-colors"
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Pages */}
        <div className="space-y-4">
          <div
            className="rounded-lg p-4 border"
            style={{ backgroundColor: "var(--item-active)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-sm font-medium">Assistant</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Ask questions in natural language and get detailed answers. Upload documents, analyze data, and have multi-turn conversations with your AI assistant.
            </p>
          </div>

          <div
            className="rounded-lg p-4 border"
            style={{ backgroundColor: "var(--item-active)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-sm font-medium">Research</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Search and synthesize information across multiple sources. Run deep research queries, compare findings, and generate structured reports from your results.
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs" style={{ color: "var(--text-muted)" }}>
          Press <kbd className="px-1.5 py-0.5 rounded text-xs border" style={{ borderColor: "var(--border)", backgroundColor: "var(--item-hover)" }}>Esc</kbd> to close
        </p>
      </div>
    </div>,
    document.body
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);

  const navLinkStyle = (active: boolean) => ({
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    backgroundColor: active ? "var(--item-active)" : "transparent",
  });

  const handleMouseEnter = (e: React.MouseEvent, active: boolean) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent, active: boolean) => {
    if (!active) {
      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
    }
  };

  return (
    <>
      <aside
        className="flex flex-col h-screen w-[220px] shrink-0 border-r"
        style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "var(--text-primary)", color: "var(--content-bg)" }}
          >
            P
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
            Para AI
          </span>
          <button
            className="ml-auto opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                style={navLinkStyle(active)}
                onMouseEnter={(e) => handleMouseEnter(e, active)}
                onMouseLeave={(e) => handleMouseLeave(e, active)}
              >
                <span className="shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="px-2 py-2 space-y-0.5 border-t" style={{ borderColor: "var(--border)" }}>
          {/* Help button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
            style={{ color: "var(--text-muted)", backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            Help
          </button>

          {/* Settings link */}
          {(() => {
            const active = pathname === "/settings";
            return (
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                style={navLinkStyle(active)}
                onMouseEnter={(e) => handleMouseEnter(e, active)}
                onMouseLeave={(e) => handleMouseLeave(e, active)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </Link>
            );
          })()}

          {/* User profile */}
          <div
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--item-hover)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
              style={{ backgroundColor: "#2a2a2a", color: "var(--text-primary)" }}
            >
              E
            </div>
            <span className="truncate text-xs">eric@example.com</span>
          </div>
        </div>
      </aside>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
