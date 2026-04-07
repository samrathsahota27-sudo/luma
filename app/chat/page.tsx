"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { TimelineBar } from "@/components/TimelineBar";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { chatPageSubtitle } from "@/lib/depthUiMicrocopy";
import { FEATURE_ONBOARDING_COPY, FEATURE_SEEN_STORAGE_KEYS } from "@/lib/featureOnboarding";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ASSISTANT_DELAY_MS = 450;

function TypingIndicator() {
  return (
    <div
      className="flex gap-1.5 px-1 py-0.5"
      role="status"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-[#6d6578] animate-pulse"
          style={{ animationDelay: `${i * 160}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { depthMode, setDepthMode } = useDepthMode();
  const [seenIntro, setSeenIntro] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const featureCopy = FEATURE_ONBOARDING_COPY.ai_chat;
  const mic = useSpeechToText((transcript) => setInput((prev) => appendTranscriptValue(prev, transcript)));

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_SEEN_STORAGE_KEYS.ai_chat) === "true";
      setSeenIntro(seen);
    } catch {
      setSeenIntro(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      recordFeatureUse("chat");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          depthMode,
          context: buildRelationshipContext("chat"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        setMessages((m) => m.slice(0, -1));
        setError("Something went wrong. Try again.");
        return;
      }

      await new Promise((r) => setTimeout(r, ASSISTANT_DELAY_MS));

      setMessages((m) => [...m, { role: "assistant", content: data.reply.trim() }]);
    } catch {
      setMessages((m) => m.slice(0, -1));
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!seenIntro) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col bg-[#0b0a0d] text-[#e8e4df]">
        <TimelineBar topOffsetClass="top-0" className="z-[52]" />
        <main className="relative flex min-h-[100svh] items-center px-5 pb-8 pt-[calc(3.5rem+max(0.6rem,env(safe-area-inset-top)))]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(135,110,190,0.18),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-[560px] rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Feature intro</p>
            <h1 className="mt-3 font-serif text-[28px] leading-tight text-white [font-family:var(--font-serif-display)]">
              {featureCopy.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70">{featureCopy.intro}</p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(FEATURE_SEEN_STORAGE_KEYS.ai_chat, "true");
                } catch {}
                setSeenIntro(true);
              }}
              className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_16px_48px_rgba(255,255,255,0.08)] transition-opacity hover:opacity-95"
            >
              Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0b0a0d] text-[#e8e4df]">
      <TimelineBar topOffsetClass="top-0" className="z-[52]" />
      <header className="shrink-0 border-b border-[#252228]/90 bg-[#100f12]/95 backdrop-blur-md px-4 pt-[calc(3.5rem+max(0.6rem,env(safe-area-inset-top)))] pb-4 md:px-6">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <Link
            href="/couple-hub"
            className="mt-0.5 rounded-lg p-2 text-[#8a8278] transition-colors hover:bg-[#1c1a1f] hover:text-[#c9c0b4]"
            aria-label="Back to couple hub"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg md:text-xl text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight">
              Talk Without Escalation
            </h1>
            <p className="mt-1 whitespace-pre-line text-xs md:text-sm text-[#7a7268] font-light leading-relaxed">
              {featureCopy.short}
            </p>
            <p className="mt-0.5 text-xs md:text-sm text-[#7a7268] font-light">
              {chatPageSubtitle(depthMode)}
            </p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-4">
          {messages.length === 0 && !loading && (
            <p className="mx-auto max-w-sm text-center text-sm text-[#6d6578] font-light leading-relaxed">
              This space stays between you and the moment. Share what&apos;s on your mind — one message
              at a time.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-lg transition-transform duration-300 ${
                  m.role === "user"
                    ? "bg-[#2a2635] text-[#ebe8e4] border border-[#3d3848]/80 rounded-br-md"
                    : "bg-[#161419] text-[#c9c0b4] border border-[#2e2a35] rounded-bl-md shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="flex max-w-[85%] items-center gap-3 rounded-2xl rounded-bl-md border border-[#2e2a35] bg-[#161419] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <TypingIndicator />
                <span className="text-sm text-[#6d6578]">typing…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} aria-hidden className="h-2 shrink-0" />
        </div>
      </main>

      <footer className="shrink-0 border-t border-[#252228]/90 bg-[#100f12]/95 backdrop-blur-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <DepthModeSelector
            value={depthMode}
            onChange={setDepthMode}
            disabled={loading}
            className="mb-3"
          />
          {error && (
            <p className="mb-3 text-center text-sm text-[#c49a8c]" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 items-end rounded-2xl border border-[#2e2a35] bg-[#141218]/90 p-2 pl-4 shadow-[0_-8px_40px_rgba(0,0,0,0.25)]">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message…"
                rows={1}
                disabled={loading}
                className="min-h-[44px] max-h-32 w-full resize-none bg-transparent py-3 pr-24 text-[15px] text-[#e8e4df] placeholder:text-[#5c564c] outline-none disabled:opacity-50"
              />
              <SpeechMicButton
                isListening={mic.isListening}
                isSupported={mic.isSupported}
                disabled={loading}
                onToggle={mic.toggle}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              />
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8e4e0] text-[#1a1816] transition-all duration-200 hover:opacity-90 disabled:pointer-events-none disabled:opacity-30"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          {mic.error ? <p className="mt-2 text-center text-xs text-[#c49a8c]">{mic.error}</p> : null}
        </div>
      </footer>
    </div>
  );
}
