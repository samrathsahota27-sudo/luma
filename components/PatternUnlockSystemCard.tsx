"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock, LockOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type UnlockLayer = {
  key: string;
  title: string;
  subtitle: string;
  locked: boolean;
  unlocked: boolean;
  imagePool: string[];
  insight: string | null;
  selectedImages: string[];
  unlockMessage: string | null;
  requirements: {
    day: number;
    reflections: number;
    questions: number;
    jointSessions: number;
  };
  progress: {
    day: number;
    reflections: number;
    questions: number;
    jointSessions: number;
  };
};

type UnlockResponse = {
  cycleStartDate: string;
  cycleDay: number;
  layers: UnlockLayer[];
};

export function PatternUnlockSystemCard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [busyLayer, setBusyLayer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UnlockResponse | null>(null);
  const [selectedByLayer, setSelectedByLayer] = useState<Record<string, string[]>>({});

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pattern-unlocks", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as UnlockResponse & { error?: string };
      if (!res.ok) throw new Error(json?.error || "Could not load unlock system.");
      setData(json);
      setSelectedByLayer((prev) => {
        const next = { ...prev };
        for (const layer of json.layers || []) {
          if (!next[layer.key]) {
            next[layer.key] = Array.isArray(layer.selectedImages) ? layer.selectedImages.slice(0, 3) : [];
          }
        }
        return next;
      });
    } catch (e: any) {
      setError(e?.message || "Could not load unlock system.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;
        setIsAuthenticated(Boolean(user));
      } catch {
        if (!active) return;
        setIsAuthenticated(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (isAuthenticated !== true) {
      setLoading(false);
      return;
    }
    void loadData();
  }, [isAuthenticated]);

  const sortedLayers = useMemo(() => data?.layers || [], [data]);

  function toggleSelection(layerKey: string, imageId: string) {
    setSelectedByLayer((prev) => {
      const current = Array.isArray(prev[layerKey]) ? prev[layerKey] : [];
      const has = current.includes(imageId);
      if (has) {
        return { ...prev, [layerKey]: current.filter((x) => x !== imageId) };
      }
      if (current.length >= 3) return prev;
      return { ...prev, [layerKey]: [...current, imageId] };
    });
  }

  async function generateLayerInsight(layer: UnlockLayer) {
    const selectedImages = selectedByLayer[layer.key] || [];
    if (selectedImages.length < 2 || busyLayer) return;
    setBusyLayer(layer.key);
    setError(null);
    try {
      const res = await fetch("/api/pattern-unlocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layerKey: layer.key,
          selectedImages,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Could not generate unlock insight.");
      setData((prev) => {
        if (!prev) return prev;
        const layers = prev.layers.map((item) => (item.key === layer.key ? { ...item, ...json.layer } : item));
        return { ...prev, layers };
      });
    } catch (e: any) {
      setError(e?.message || "Could not generate unlock insight.");
    } finally {
      setBusyLayer(null);
    }
  }

  return (
    <Card className="border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
      <CardHeader>
        <CardTitle className="font-serif text-[28px] leading-tight text-white [font-family:var(--font-serif-display)] tracking-tight">
          Pattern Unlocks
        </CardTitle>
        <CardDescription className="text-white/60">
          Discovery layers open as your mirror gains enough signal from real activity, not arbitrary gates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated === false ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/80">Sign in to unlock your deeper pattern layers.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading unlock progression...
          </div>
        ) : null}

        {!loading &&
          sortedLayers.map((layer) => {
            const selected = selectedByLayer[layer.key] || [];
            const canGenerate = layer.unlocked && selected.length >= 2;
            return (
              <div key={layer.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{layer.title}</p>
                    <p className="mt-1 text-xs text-white/55">{layer.subtitle}</p>
                  </div>
                  {layer.unlocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-100">
                      <LockOpen className="h-3.5 w-3.5" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60">
                      <Lock className="h-3.5 w-3.5" />
                      Locked
                    </span>
                  )}
                </div>

                {layer.locked ? (
                  <>
                    <p className="mt-3 text-sm text-white/65">
                      {layer.unlockMessage || "Your mirror isn’t ready to reveal this layer yet — keep reflecting together."}
                    </p>
                    <p className="mt-2 text-xs text-white/45">
                      Requires Day {layer.requirements.day}, {layer.requirements.reflections} reflections, {layer.requirements.questions} nightly answers, {layer.requirements.jointSessions} joint sessions.
                    </p>
                  </>
                ) : (
                  <>
                    {layer.insight ? (
                      <div className="mt-3 rounded-xl border border-violet-200/25 bg-violet-300/[0.08] px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.15em] text-violet-100/75">Unlocked Insight</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/85">{layer.insight}</p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-white/65">
                        Layer unlocked. Do a quick targeted image re-selection to reveal this insight.
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {layer.imagePool.map((img) => {
                        const active = selected.includes(img);
                        return (
                          <button
                            key={`${layer.key}-${img}`}
                            type="button"
                            onClick={() => toggleSelection(layer.key, img)}
                            className={[
                              "relative overflow-hidden rounded-lg border transition",
                              active ? "border-violet-300/45 ring-1 ring-violet-300/45" : "border-white/10",
                            ].join(" ")}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/${img}`} alt={img} className="h-14 w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-white/45">Select 2-3 images to reveal this layer.</p>
                      <Button
                        type="button"
                        disabled={!canGenerate || busyLayer != null}
                        onClick={() => {
                          void generateLayerInsight(layer);
                        }}
                        className="bg-white text-[#120f18] hover:bg-white/90"
                      >
                        {busyLayer === layer.key ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Revealing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Reveal Insight
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
