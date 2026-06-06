interface PageShellProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-8 py-5 border-b text-sm"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <span>Assistant</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={{ color: "var(--text-primary)" }}>{title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        )}
        {children ?? (
          <div
            className="flex items-center justify-center h-48 rounded-lg border border-dashed text-sm"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            No content yet
          </div>
        )}
      </div>
    </div>
  );
}
