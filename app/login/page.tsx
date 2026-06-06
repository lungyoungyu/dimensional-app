"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, isAuthenticated } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace("/assistant");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400)); // brief delay for realism

    if (signIn(email, password)) {
      router.replace("/assistant");
    } else {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ backgroundColor: "var(--content-bg)" }}
    >
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: "var(--text-primary)", color: "var(--content-bg)" }}
          >
            P
          </div>
          <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Para AI
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: "#111111", borderColor: "var(--border)" }}
        >
          <h1 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Sign in
          </h1>
          <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
            Enter your credentials to access Para AI.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "#161616",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "#161616",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {error && (
              <p className="text-xs" style={{ color: "#ff6b6b" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-sm font-medium transition-opacity mt-1"
              style={{
                backgroundColor: "var(--text-primary)",
                color: "var(--content-bg)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          Demo credentials: <span style={{ color: "var(--text-primary)" }}>eric@example.com</span> / <span style={{ color: "var(--text-primary)" }}>demo</span>
        </p>
      </div>
    </div>
  );
}
