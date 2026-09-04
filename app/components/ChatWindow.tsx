"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getSettings } from "../hooks/useSettings";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[70%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{ backgroundColor: "#2a2a2a", color: "var(--text-primary)" }}
      >
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: "var(--text-primary)", color: "var(--content-bg)" }}
      >
        P
      </div>
      <div
        className="flex-1 text-sm leading-relaxed pt-0.5"
        style={{ color: "var(--text-primary)" }}
      >
        {content}
        {streaming && (
          <span
            className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse"
            style={{ backgroundColor: "var(--text-muted)" }}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
        style={{ backgroundColor: "var(--item-active)", color: "var(--text-primary)" }}
      >
        P
      </div>
      <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
        How can I help you today?
      </p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Ask me anything.
      </p>
    </div>
  );
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Append empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const { provider, anthropicApiKey, openaiApiKey, anthropicModel, openaiModel, systemPrompt } = getSettings();
      const apiKey = provider === "openai" ? openaiApiKey : anthropicApiKey;
      const model = provider === "openai" ? openaiModel : anthropicModel;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, provider, apiKey, model, systemPrompt }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Check that your API key is set in Settings.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserMessage key={i} content={msg.content} />
              ) : (
                <AssistantMessage
                  key={i}
                  content={msg.content}
                  streaming={loading && i === messages.length - 1}
                />
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-3 rounded-xl border px-4 py-3"
            style={{ backgroundColor: "#161616", borderColor: "var(--border)" }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              placeholder="Message Para AI…"
              disabled={loading}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:opacity-40"
              style={{ color: "var(--text-primary)", maxHeight: "160px" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity"
              style={{
                backgroundColor: input.trim() && !loading ? "var(--text-primary)" : "var(--item-active)",
                color: "var(--content-bg)",
                opacity: input.trim() && !loading ? 1 : 0.4,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
