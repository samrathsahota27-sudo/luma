"use client";

import { useMemo, useState } from "react";
import { X, Loader2, Copy, Check } from "lucide-react";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import {
  hubChatEmptyPrompt,
  hubOverlayActionLabel,
  hubOverlayMicro,
  hubOverlayPlaceholder,
} from "@/lib/depthUiMicrocopy";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { updateMemory } from "@/lib/memory";
import { supabase } from "@/lib/supabase";

type OverlayKind = "translator" | "mind" | "date" | "chat";

type TranslatorResult = { said: string; meant: string; trap: string; do: string };
type MindResult = { behavior: string; interpretations: string; need: string; confirm: string };
type DateResult = { state: string; missing: string; plan: string };

export function CoupleHubOverlay({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: OverlayKind;
  onClose: () => void;
}) {
  const { depthMode, setDepthMode } = useDepthMode();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [translator, setTranslator] = useState<TranslatorResult | null>(null);
  const [mind, setMind] = useState<MindResult | null>(null);
  const [date, setDate] = useState<DateResult | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const title = useMemo(() => {
    switch (kind) {
      case "translator":
        return "Translator";
      case "mind":
        return "Their Mind";
      case "date":
        return "Date AI";
      case "chat":
        return "Chat";
    }
  }, [kind]);

  const micro = useMemo(() => hubOverlayMicro(kind, depthMode), [kind, depthMode]);

  const placeholder = useMemo(() => hubOverlayPlaceholder(kind, depthMode), [kind, depthMode]);

  const actionLabel = useMemo(() => hubOverlayActionLabel(kind, depthMode), [kind, depthMode]);

  function resetResults() {
    setTranslator(null);
    setMind(null);
    setDate(null);
  }

  async function syncToSupabase(memory: any) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("users_memory").upsert({
        user_id: user.id,
        memory,
        updated_at: new Date().toISOString(),
      });
    } catch {}
  }

  async function run() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    resetResults();

    try {
      if (kind === "translator") recordFeatureUse("translate");
      if (kind === "mind") recordFeatureUse("mind");
      if (kind === "date") recordFeatureUse("date");
      if (kind === "chat") recordFeatureUse("chat");

      if (kind === "chat") {
        const nextHistory = [...chatHistory, { role: "user", content: trimmed }];
        setChatHistory(nextHistory);
        setText("");
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextHistory, depthMode, context: buildRelationshipContext("chat") }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || typeof data.reply !== "string") throw new Error("chat_failed");
        setChatHistory((h) => [...h, { role: "assistant", content: data.reply.trim() }]);
        setLoading(false);
        return;
      }

      const endpoint = kind === "translator" ? "/api/translate" : kind === "mind" ? "/api/mind" : "/api/date";
      const payload =
        kind === "translator"
          ? { message: trimmed, depthMode, context: buildRelationshipContext("translate") }
          : kind === "mind"
            ? { text: trimmed, depthMode, context: buildRelationshipContext("mind") }
            : { text: trimmed, depthMode, context: buildRelationshipContext("date") };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("api_failed");

      if (kind === "translator") {
        if (typeof data.said !== "string" || typeof data.meant !== "string" || typeof data.trap !== "string")
          throw new Error("shape");
        const doText =
          typeof data.do === "string"
            ? data.do
            : typeof data.better === "string"
              ? data.better
              : typeof data.betterResponse === "string"
                ? data.betterResponse
                : "";
        if (!doText) throw new Error("shape");
        setTranslator({ said: data.said, meant: data.meant, trap: data.trap, do: doText });

        const now = new Date().toISOString();
        const memory = updateMemory((m) => {
          const conflicts = Array.isArray(m.conflicts) ? m.conflicts : [];
          const timeline = Array.isArray(m.timeline) ? m.timeline : [];
          const scores = m.scores ?? { connection: 0, conflict: 0, distance: 0 };
          const comm = Array.isArray(m.patterns?.communication) ? m.patterns.communication : [];

          conflicts.push({ originalText: trimmed, aiInterpretation: data, createdAt: now });
          timeline.push({ type: "translator", date: now });
          comm.push({ type: "conflict", createdAt: now });

          return {
            ...m,
            conflicts,
            timeline,
            patterns: { ...m.patterns, communication: comm },
            scores: { ...scores, conflict: (scores.conflict ?? 0) + 1 },
          };
        });
        await syncToSupabase(memory);
      }

      if (kind === "mind") {
        if (
          typeof data.behavior !== "string" ||
          typeof data.interpretations !== "string" ||
          typeof data.need !== "string" ||
          typeof data.confirm !== "string"
        )
          throw new Error("shape");
        setMind({
          behavior: data.behavior,
          interpretations: data.interpretations,
          need: data.need,
          confirm: data.confirm,
        });
      }

      if (kind === "date") {
        const missing = typeof data.missing === "string" ? data.missing : typeof data.need === "string" ? data.need : "";
        if (typeof data.state !== "string" || typeof data.plan !== "string" || !missing) throw new Error("shape");
        setDate({ state: data.state, missing, plan: data.plan });
      }
    } catch {
      setError("Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#050508]/85 backdrop-blur-xl">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_-10%,rgba(180,150,255,0.16),transparent)]" />
      <div className="absolute inset-0 overflow-y-auto overscroll-contain px-5 py-6 md:px-8">
        <div className="mx-auto w-full max-w-[820px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{micro}</p>
              <h1 className="mt-2 font-serif text-2xl md:text-3xl text-white [font-family:var(--font-serif-display)]">
                {title}
              </h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-white/75 hover:text-white hover:bg-white/[0.06] transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6 shadow-[0_26px_90px_rgba(0,0,0,0.55)]">
            <DepthModeSelector value={depthMode} onChange={setDepthMode} disabled={loading} className="mb-5" />

            {kind !== "chat" && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={5}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-[15px] text-white placeholder:text-white/35 outline-none transition-[box-shadow,border-color,background] duration-200 focus:border-white/20 focus:bg-white/[0.03] focus:shadow-[0_0_0_4px_rgba(123,106,168,0.18)] disabled:opacity-50"
              />
            )}

            {kind === "chat" && (
              <div className="space-y-4">
                <div className="max-h-[46vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  {chatHistory.length === 0 ? (
                    <p className="text-sm text-white/45">{hubChatEmptyPrompt(depthMode)}</p>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((m, i) => (
                        <div
                          key={`${m.role}-${i}-${m.content.slice(0, 10)}`}
                          className={[
                            "rounded-2xl px-4 py-3 text-sm leading-relaxed border",
                            m.role === "user"
                              ? "ml-auto max-w-[85%] border-white/10 bg-white/[0.05] text-white/90"
                              : "mr-auto max-w-[85%] border-white/10 bg-black/20 text-white/80",
                          ].join(" ")}
                        >
                          {m.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    disabled={loading}
                    className="flex-1 rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20 focus:bg-white/[0.03]"
                  />
                  <button
                    type="button"
                    onClick={run}
                    disabled={loading || !text.trim()}
                    className="rounded-2xl bg-white text-[#0b0a0d] px-5 py-3 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none shadow-[0_12px_40px_rgba(255,255,255,0.10)]"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                  </button>
                </div>
              </div>
            )}

            {kind !== "chat" && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={run}
                  disabled={loading || !text.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] px-6 py-3 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none shadow-[0_12px_40px_rgba(255,255,255,0.10)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working…
                    </>
                  ) : (
                    actionLabel
                  )}
                </button>

                {error && <p className="text-xs text-[#f0b4a6]">{error}</p>}
              </div>
            )}
          </div>

          {(translator || mind || date) && (
            <div className="mt-6 grid gap-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
              {translator && (
                <>
                  <Block title="What they said" value={translator.said} />
                  <Block title="What they meant" value={translator.meant} />
                  <Block
                    title="What to do"
                    value={translator.do}
                    actionLabel={copied ? "Copied" : "Copy"}
                    onAction={() => copy(translator.do)}
                    actionIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  />
                  <div className="md:col-span-3">
                    <Block title="The trap" value={translator.trap} tone="warn" />
                  </div>
                </>
              )}

              {mind && (
                <>
                  <Block title="Behavior" value={mind.behavior} />
                  <Block title="Interpretations" value={mind.interpretations} />
                  <Block title="Ask to confirm" value={mind.confirm} />
                  <div className="md:col-span-3">
                    <Block title="What they might need" value={mind.need} />
                  </div>
                </>
              )}

              {date && (
                <>
                  <Block title="Current state" value={date.state} />
                  <Block title="What’s missing" value={date.missing} />
                  <Block title="The plan" value={date.plan} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  value,
  tone = "base",
  actionLabel,
  actionIcon,
  onAction,
}: {
  title: string;
  value: string;
  tone?: "base" | "warn";
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <section
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        tone === "warn" ? "bg-[#2a1111]/35 border-[#6b2d2d]/35" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium">{title}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 hover:text-white hover:bg-white/[0.06] transition"
          >
            {actionIcon}
            {actionLabel}
          </button>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/85 whitespace-pre-wrap">{value}</p>
    </section>
  );
}

