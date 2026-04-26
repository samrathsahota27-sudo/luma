"use client";

import Link from "next/link";
import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Flame,
  Heart,
  Loader2,
  Plus,
  Share2,
  Sparkles,
  Cake,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePWA } from "@/hooks/usePWA";
import { PWA_INSTALL_ACCEPTED_KEY, PWA_INSTALL_DISMISSED_KEY } from "@/lib/pwaInstall";
import { SharedMirrorInviteCard } from "@/components/SharedMirrorInviteCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActivityProgressBar } from "@/components/us/ActivityProgressBar";
import { ProfileCompletionRing } from "@/components/us/ProfileCompletionRing";

type MirrorOverlap = {
  insight?: string;
};

type MirrorStatus = {
  hasSession?: boolean;
  state?: "waiting" | "connected";
  partnerJoined?: boolean;
  overlap?: MirrorOverlap | null;
};

type UserProfile = {
  id: string;
  email?: string | null;
  profile_photo_url?: string | null;
  anniversary_date?: string | null;
  birthday_date?: string | null;
  couple_journey_start_date?: string | null;
  pattern_history?: unknown[];
  couple_sessions?: unknown[];
};

type EditableField = "photo" | "anniversary" | "birthday" | null;

type ActivityMetrics = {
  completionPercent: number;
  profileCompletionSteps: number;
  profileCompletionDone: number;
  profileStepMap?: {
    photo?: boolean;
    anniversary?: boolean;
    birthday?: boolean;
    joint_reflection?: boolean;
    onboarding_goals?: boolean;
  };
  encouragement?: string;
  personalizationHint?: string;
  milestone?: number;
  individualCount: number;
  jointCount: number;
  tonightCount: number;
  totalCompleted: number;
  individualPercent: number;
  jointPercent: number;
  streakDays: number;
  streakPercent: number;
  streakBroken?: boolean;
  streakMessage?: string;
  lastActivityDate?: string | null;
  cycleWeek: number;
  patternSignal?: string | null;
  patternShifts?: number;
  unlockHint?: string;
  shareText: string;
};

function formatNameFromEmail(email: string | null | undefined) {
  const raw = (email || "").split("@")[0] || "Samrath";
  if (!raw) return "Samrath";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getJourneyMeta(startDate: string | null | undefined) {
  if (!startDate) return { day: 1, week: 1 };
  const start = Date.parse(`${startDate}T00:00:00.000Z`);
  if (!Number.isFinite(start)) return { day: 1, week: 1 };

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsedDays = Math.max(0, Math.floor((todayUtc - start) / 86400000));
  const day = Math.min(28, elapsedDays + 1);
  const week = Math.min(4, Math.floor((day - 1) / 7) + 1);
  return { day, week };
}

async function buildShareCardBlob({
  streakDays,
  jointCount,
  individualCount,
  patternShifts,
}: {
  streakDays: number;
  jointCount: number;
  individualCount: number;
  patternShifts: number;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#1b1224");
  gradient.addColorStop(0.55, "#1a2036");
  gradient.addColorStop(1, "#10141f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(860, 240, 190, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(190, 980, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 42px Inter, system-ui, sans-serif";
  ctx.fillText("Luma Mirror Stats", 96, 122);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "400 26px Inter, system-ui, sans-serif";
  ctx.fillText("Built through your shared reflection journey", 96, 168);

  const cards = [
    { label: "Current streak", value: `${streakDays} days`, color: "#fbbf24" },
    { label: "Joint reflections", value: `${jointCount}`, color: "#c4b5fd" },
    { label: "Individual reflections", value: `${individualCount}`, color: "#86efac" },
    { label: "Pattern shifts", value: `${patternShifts}`, color: "#93c5fd" },
  ];

  cards.forEach((card, index) => {
    const x = index % 2 === 0 ? 96 : 560;
    const y = index < 2 ? 270 : 570;
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(x, y, 424, 230);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.strokeRect(x, y, 424, 230);

    ctx.fillStyle = card.color;
    ctx.fillRect(x + 26, y + 28, 44, 6);
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    ctx.fillText(card.label, x + 26, y + 76);

    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.font = "700 52px Inter, system-ui, sans-serif";
    ctx.fillText(card.value, x + 26, y + 154);
  });

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillText("Keep your streak alive to unlock deeper pattern insights.", 96, 960);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "400 21px Inter, system-ui, sans-serif";
  ctx.fillText("luma.app", 96, 1260);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((file) => resolve(file), "image/png", 0.95);
  });
  return blob;
}

export default function UsPage() {
  const supabase = createClient();
  const isPWA = usePWA();
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<EditableField>(null);
  const [activeField, setActiveField] = useState<EditableField>(null);
  const [openInvite, setOpenInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mirrorStatus, setMirrorStatus] = useState<MirrorStatus | null>(null);
  const [activity, setActivity] = useState<ActivityMetrics | null>(null);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied">("idle");
  const [online, setOnline] = useState(true);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [milestoneBurst, setMilestoneBurst] = useState<number>(0);
  const completionRef = useRef<number>(0);

  const [anniversaryDraft, setAnniversaryDraft] = useState("");
  const [birthdayDraft, setBirthdayDraft] = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const loadActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/us/activity", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as ActivityMetrics;
      setActivity(json);
    } catch {
      // Keep UI resilient and non-blocking.
    }
  }, []);

  const loadMirrorStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/shared-mirror", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as MirrorStatus;
      setMirrorStatus(json);
    } catch {
      // Keep page usable if partner status fetch fails.
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEmail(null);
        setUserId(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setEmail(user.email ?? null);
      setUserId(user.id);

      const { data: loadedProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const nextProfile = (loadedProfile || {
        id: user.id,
        email: user.email ?? null,
        profile_photo_url: null,
        anniversary_date: null,
        birthday_date: null,
        couple_journey_start_date: null,
        pattern_history: [],
        couple_sessions: [],
      }) as UserProfile;

      setProfile(nextProfile);
      setAnniversaryDraft(nextProfile.anniversary_date || "");
      setBirthdayDraft(nextProfile.birthday_date || "");
      await Promise.all([loadMirrorStatus(), loadActivity()]);
    } catch (e: any) {
      setError(e?.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [loadActivity, loadMirrorStatus, supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const sync = () => setOnline(window.navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (isPWA) {
      setShowInstallHint(false);
      return;
    }
    try {
      const accepted = localStorage.getItem(PWA_INSTALL_ACCEPTED_KEY) === "true";
      const dismissed = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === "true";
      setShowInstallHint(!accepted && !dismissed);
    } catch {
      setShowInstallHint(true);
    }
  }, [isPWA]);

  useEffect(() => {
    if (!mirrorStatus?.state || mirrorStatus.state !== "waiting") return;
    const timer = window.setInterval(() => {
      void loadMirrorStatus();
    }, 4500);
    return () => window.clearInterval(timer);
  }, [loadMirrorStatus, mirrorStatus?.state]);

  useEffect(() => {
    if (!userId) return;
    const channelA = supabase
      .channel(`us-mirror-a-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "couple_sessions",
          filter: `user_a_id=eq.${userId}`,
        },
        () => {
          void loadMirrorStatus();
        }
      )
      .subscribe();

    const channelB = supabase
      .channel(`us-mirror-b-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "couple_sessions",
          filter: `user_b_id=eq.${userId}`,
        },
        () => {
          void loadMirrorStatus();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channelA);
      void supabase.removeChannel(channelB);
    };
  }, [loadMirrorStatus, supabase, userId]);

  const upsertProfile = useCallback(
    async (patch: Partial<UserProfile>, field: EditableField) => {
      if (!userId) return;
      setSavingField(field);
      setError(null);
      try {
        const payload = {
          id: userId,
          email,
          ...patch,
          last_updated: new Date().toISOString(),
        };
        const { error: updateError } = await supabase.from("user_profiles").upsert(payload);
        if (updateError) throw updateError;

        setProfile((prev) => ({ ...(prev || ({ id: userId } as UserProfile)), ...patch }));
        setActiveField(null);
        await loadActivity();
      } catch (e: any) {
        setError(e?.message || "Could not save this field.");
      } finally {
        setSavingField(null);
      }
    },
    [email, loadActivity, supabase, userId]
  );

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      if (!userId) return;
      setSavingField("photo");
      setError(null);
      try {
        const formData = new FormData();
        formData.append("photo", file);
        const res = await fetch("/api/us/photo", {
          method: "POST",
          body: formData,
        });
        const json = (await res.json().catch(() => ({}))) as { photoUrl?: string; error?: string };
        if (!res.ok || !json.photoUrl) throw new Error(json.error || "Could not upload photo.");

        setProfile((prev) => ({
          ...(prev || ({ id: userId } as UserProfile)),
          profile_photo_url: json.photoUrl!,
        }));
        await loadActivity();
      } catch (e: any) {
        setError(e?.message || "Could not upload photo.");
      } finally {
        setSavingField(null);
      }
    },
    [loadActivity, userId]
  );

  const handlePhotoPick = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await uploadProfilePhoto(file);
      event.target.value = "";
    },
    [uploadProfilePhoto]
  );

  const handleShareStats = useCallback(async () => {
    const text = activity?.shareText;
    if (!text) return;
    try {
      const blob = await buildShareCardBlob({
        streakDays: activity?.streakDays ?? 0,
        jointCount: activity?.jointCount ?? 0,
        individualCount: activity?.individualCount ?? 0,
        patternShifts: activity?.patternShifts ?? 0,
      });

      if (navigator.share && blob) {
        const file = new File([blob], "luma-mirror-stats.png", { type: "image/png" });
        const canShareFile = typeof navigator.canShare === "function" ? navigator.canShare({ files: [file] }) : false;
        if (canShareFile) {
          await navigator.share({
            title: "My Luma Mirror Stats",
            text,
            files: [file],
          });
          setShareState("shared");
          window.setTimeout(() => setShareState("idle"), 2200);
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: "My Luma Mirror Stats",
          text,
        });
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(text);
        setShareState("copied");
      }
      window.setTimeout(() => setShareState("idle"), 2200);
    } catch {
      // No-op: user may cancel share sheet.
    }
  }, [activity?.shareText]);

  const displayName = useMemo(() => formatNameFromEmail(email), [email]);
  const journey = useMemo(() => getJourneyMeta(profile?.couple_journey_start_date), [profile?.couple_journey_start_date]);

  const hasJointReflection = (activity?.jointCount || profile?.couple_sessions?.length || 0) > 0;
  const completionItems = [
    Boolean(profile?.profile_photo_url),
    Boolean(profile?.anniversary_date),
    Boolean(profile?.birthday_date),
    hasJointReflection,
    Boolean(activity?.profileStepMap?.onboarding_goals),
  ];
  const completedCount = activity?.profileCompletionDone ?? completionItems.filter(Boolean).length;
  const completionPercent =
    typeof activity?.completionPercent === "number"
      ? activity.completionPercent
      : Math.round((completedCount / completionItems.length) * 100);
  const partnerConnected = mirrorStatus?.state === "connected" || mirrorStatus?.partnerJoined === true;

  const reflectionCount = activity?.totalCompleted ?? (profile?.pattern_history?.length || 0) + (profile?.couple_sessions?.length || 0);
  const completionMessage = activity?.encouragement || "Let's strengthen your mirror.";
  const personalizationHint =
    activity?.personalizationHint ||
    "Adding profile details helps tailor Mirror Questions to your relationship context.";

  useEffect(() => {
    const previous = completionRef.current;
    const milestones = [20, 40, 60, 80, 100];
    const reached = milestones.find((mark) => previous < mark && completionPercent >= mark);
    if (reached) {
      setMilestoneBurst(reached);
      window.setTimeout(() => setMilestoneBurst(0), 1300);
    }
    completionRef.current = completionPercent;
  }, [completionPercent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-5 pb-[96px] pt-6 text-white">
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Building your Us space...
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-5 pb-[96px] pt-10 text-white">
        <div className="mx-auto max-w-[760px] rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-white/55">Us</p>
          <h1 className="mt-2 font-serif text-3xl [font-family:var(--font-serif-display)]">Your shared mirror awaits</h1>
          <p className="mt-3 text-sm text-white/70">Sign in to build your profile, invite your partner, and track your reflection journey together.</p>
          <Button asChild className="mt-5 bg-white text-black hover:bg-white/90">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0a12] px-4 pb-[96px] pt-5 text-white sm:px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,rgba(255,170,206,0.35),transparent_65%),radial-gradient(70%_60%_at_85%_90%,rgba(130,90,160,0.2),transparent_65%),linear-gradient(180deg,#190f1f_0%,#0d0a11_55%,#0a0a0a_100%)]" />

      <Heart className="floating-heart heart-1 pointer-events-none absolute h-6 w-6 text-pink-200/20" />
      <Heart className="floating-heart heart-2 pointer-events-none absolute h-5 w-5 text-rose-200/15" />
      <Heart className="floating-heart heart-3 pointer-events-none absolute h-7 w-7 text-fuchsia-200/15" />
      <Heart className="floating-heart heart-4 pointer-events-none absolute h-4 w-4 text-pink-100/20" />

      <main className="relative mx-auto w-full max-w-[760px]">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-pink-100/70">Us</p>
          <h1 className="mt-2 font-serif text-[36px] leading-tight [font-family:var(--font-serif-display)]">Your shared reflection</h1>
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-white/75">
            A warm space to build your mirror, connect your partner, and track how your relationship shifts across the cycle.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!online ? (
              <span className="inline-flex items-center rounded-full border border-amber-200/30 bg-amber-200/15 px-3 py-1 text-xs text-amber-100">
                Offline mode: changes sync once you reconnect
              </span>
            ) : null}
            {showInstallHint ? (
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90"
                onClick={() => {
                  try {
                    localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, "true");
                  } catch {
                    // Ignore storage failures.
                  }
                  setShowInstallHint(false);
                }}
              >
                Install Luma for the full-screen PWA experience
              </button>
            ) : null}
          </div>
        </header>

        <Card className="rounded-[28px] border-white/15 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div className="flex flex-1 items-center justify-center gap-4 sm:gap-7">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24 border border-white/20 shadow-[0_10px_28px_rgba(0,0,0,0.35)] sm:h-28 sm:w-28">
                    <AvatarImage src={profile?.profile_photo_url || undefined} alt={displayName} loading="lazy" />
                    <AvatarFallback className="bg-white/12 text-3xl text-white">{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-white/90">{displayName}</p>
                </div>

                <div className={`merge-line hidden h-[2px] w-10 rounded-full bg-white/25 sm:block ${partnerConnected ? "connected" : ""}`} />

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenInvite((prev) => !prev)}
                    className={`relative flex h-24 w-24 items-center justify-center rounded-full border text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition hover:bg-white/10 sm:h-28 sm:w-28 ${
                      partnerConnected
                        ? "border-emerald-200/50 bg-emerald-300/15"
                        : "pulse-dashed border-2 border-dashed border-pink-200/55 bg-white/5"
                    }`}
                    aria-label={partnerConnected ? "Partner connected" : "Add partner"}
                  >
                    {partnerConnected ? (
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-transparent text-3xl text-emerald-100">P</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Plus className="h-8 w-8" />
                    )}
                  </button>
                  <p className="text-sm font-medium text-white/90">{partnerConnected ? "Partner" : "Add Partner"}</p>
                </div>
              </div>
            </div>

            {partnerConnected ? (
              <div className="mt-5 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 px-4 py-3">
                <p className="text-sm font-medium text-emerald-100">Both mirrors connected ✨</p>
                {mirrorStatus?.overlap?.insight ? (
                  <p className="mt-1 text-sm leading-relaxed text-emerald-100/85">{mirrorStatus.overlap.insight}</p>
                ) : (
                  <p className="mt-1 text-sm leading-relaxed text-emerald-100/85">You are now syncing your reflections in one shared mirror space.</p>
                )}
              </div>
            ) : (
              <p className="mt-5 text-center text-sm text-white/70">
                Invite your partner to connect both mirrors and start your first shared insight.
              </p>
            )}

            {openInvite ? <SharedMirrorInviteCard autoCreate className="mt-5" /> : null}
          </CardContent>
        </Card>

        <Card className="mt-5 overflow-hidden rounded-[26px] border-sky-100/25 bg-gradient-to-br from-[#b7d9ff]/25 via-[#9ec2ff]/18 to-[#7fa9ff]/10 shadow-[0_20px_70px_rgba(20,30,60,0.35)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-white">Complete your mirror</CardTitle>
                <CardDescription className="mt-1 text-white/80">
                  {completedCount} of {activity?.profileCompletionSteps || completionItems.length} milestones complete
                </CardDescription>
                <p className="mt-2 text-sm text-white/90">{completionMessage}</p>
                <p className="mt-1 text-xs text-white/75">{personalizationHint}</p>
              </div>
              <ProfileCompletionRing value={completionPercent} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            {milestoneBurst > 0 ? (
              <div className="pointer-events-none relative -mb-1 h-0" aria-hidden>
                <span className="milestone-heart left-[22%]">❤</span>
                <span className="milestone-heart left-[38%] [animation-delay:80ms]">❤</span>
                <span className="milestone-heart left-[55%] [animation-delay:40ms]">❤</span>
                <span className="milestone-heart left-[71%] [animation-delay:130ms]">❤</span>
              </div>
            ) : null}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handlePhotoPick}
            />
            <div className="rounded-xl border border-white/20 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-white/85" />
                  <p className="text-sm text-white">Profile Photo</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-10 px-4 bg-white/20 text-white hover:bg-white/30"
                  disabled={savingField === "photo"}
                  onClick={() => photoInputRef.current?.click()}
                >
                  {savingField === "photo" ? "Uploading..." : profile?.profile_photo_url ? "Edit" : "Add"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-white/65">Uploaded securely to your private Luma profile storage.</p>
            </div>

            <div className="rounded-xl border border-white/20 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-white/85" />
                  <p className="text-sm text-white">Couple Anniversary</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-10 px-4 bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setActiveField((prev) => (prev === "anniversary" ? null : "anniversary"))}
                >
                  {profile?.anniversary_date ? "Edit" : "Add"}
                </Button>
              </div>
              {activeField === "anniversary" ? (
                <div className="mt-3 flex gap-2">
                  <Input
                    type="date"
                    value={anniversaryDraft}
                    onChange={(e) => setAnniversaryDraft(e.target.value)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 px-4 bg-white text-black hover:bg-white/90"
                    disabled={savingField === "anniversary"}
                    onClick={() => void upsertProfile({ anniversary_date: anniversaryDraft || null }, "anniversary")}
                  >
                    {savingField === "anniversary" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/20 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-white/85" />
                  <p className="text-sm text-white">Your Birthday</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-10 px-4 bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setActiveField((prev) => (prev === "birthday" ? null : "birthday"))}
                >
                  {profile?.birthday_date ? "Edit" : "Add"}
                </Button>
              </div>
              {activeField === "birthday" ? (
                <div className="mt-3 flex gap-2">
                  <Input
                    type="date"
                    value={birthdayDraft}
                    onChange={(e) => setBirthdayDraft(e.target.value)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 px-4 bg-white text-black hover:bg-white/90"
                    disabled={savingField === "birthday"}
                    onClick={() => void upsertProfile({ birthday_date: birthdayDraft || null }, "birthday")}
                  >
                    {savingField === "birthday" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/20 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white/85" />
                  <p className="text-sm text-white">Onboarding Goals</p>
                </div>
                <Button asChild size="sm" className="h-10 px-4 bg-white text-black hover:bg-white/90">
                  <Link href="/test">
                    {activity?.profileStepMap?.onboarding_goals ? (
                      <>
                        <Check className="h-4 w-4" />
                        Done
                      </>
                    ) : (
                      <>
                        Add
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Link>
                </Button>
              </div>
              <p className="mt-2 text-xs text-white/65">
                Answering onboarding goals helps tailor special Mirror Questions and relational guidance.
              </p>
            </div>

            <div className="rounded-xl border border-white/20 bg-black/15 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white/85" />
                  <p className="text-sm text-white">Start joint reflection</p>
                </div>
                <Button asChild size="sm" className="h-10 px-4 bg-white text-black hover:bg-white/90">
                  <Link href="/couple/start">
                    {hasJointReflection ? (
                      <>
                        <Check className="h-4 w-4" />
                        Done
                      </>
                    ) : (
                      <>
                        Start
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-5 rounded-[26px] border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-1">
            <CardTitle className="text-xl text-white">Your Activity</CardTitle>
            <CardDescription className="text-white/65">
              Motivating momentum based on your reflections, tonight questions, and cycle rhythm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Total Content Completed</p>
              <p className="mt-1 text-xs text-white/60">{reflectionCount} total moments completed</p>
              <div className="mt-4 animate-luma-fade-in">
                <ActivityProgressBar
                  label={`Individual reflections (${activity?.individualCount ?? profile?.pattern_history?.length ?? 0})`}
                  value={activity?.individualPercent ?? 0}
                  tone="green"
                  hint="Personal pattern work"
                />
                <div className="my-2 h-[1px] w-full bg-gradient-to-r from-emerald-300/35 via-white/20 to-violet-300/35" />
                <ActivityProgressBar
                  label={`Joint reflections (${activity?.jointCount ?? profile?.couple_sessions?.length ?? 0})`}
                  value={activity?.jointPercent ?? 0}
                  tone="purple"
                  hint="Shared relational mirror work"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-300" />
                <p className="text-sm font-medium text-white">Current Streak</p>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {activity?.streakDays ?? 0} day streak
                {activity?.patternSignal ? ` · Pattern in focus: ${activity.patternSignal}` : ""}
              </p>
              {activity?.streakMessage ? (
                <p className="mt-1 text-xs text-white/75">{activity.streakMessage}</p>
              ) : null}
              <div className="mt-3 animate-luma-fade-in-slow">
                <ActivityProgressBar
                  label={`Week ${activity?.cycleWeek ?? journey.week} consistency`}
                  value={activity?.streakPercent ?? 0}
                  tone="orange"
                  hint="Built from consecutive reflection or Tonight's Question days"
                />
              </div>
              {activity?.unlockHint ? (
                <p className="mt-2 text-xs text-violet-200/90">{activity.unlockHint}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                void handleShareStats();
              }}
              className="w-full rounded-2xl border border-white/15 bg-[linear-gradient(135deg,rgba(124,58,237,0.58),rgba(59,130,246,0.45))] px-4 py-4 text-left shadow-[0_14px_40px_rgba(36,12,80,0.45)] transition hover:brightness-110"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-violet-100/90">Celebrate progress</p>
                  <p className="mt-1 text-base font-semibold text-white">Share your stats</p>
                  <p className="mt-1 text-sm text-white/85">
                    {shareState === "shared"
                      ? "Shared successfully"
                      : shareState === "copied"
                        ? "Copied to clipboard"
                        : "Generate a beautiful social summary card of your progress"}
                  </p>
                </div>
                <Share2 className="h-5 w-5 text-white/90" />
              </div>
            </button>
          </CardContent>
        </Card>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>
        ) : null}
      </main>

      <style jsx>{`
        .floating-heart {
          animation: floatHeart 7s ease-in-out infinite;
        }

        .heart-1 {
          left: 10%;
          top: 16%;
          animation-delay: 0s;
        }

        .heart-2 {
          right: 12%;
          top: 24%;
          animation-delay: 1.4s;
        }

        .heart-3 {
          right: 18%;
          bottom: 18%;
          animation-delay: 2.1s;
        }

        .heart-4 {
          left: 14%;
          bottom: 24%;
          animation-delay: 3s;
        }

        .pulse-dashed {
          animation: partnerPulse 2.4s ease-in-out infinite;
        }

        .merge-line.connected {
          animation: mergePulse 2s ease-in-out infinite;
        }

        .milestone-heart {
          position: absolute;
          top: -2px;
          color: rgba(255, 196, 224, 0.95);
          font-size: 14px;
          animation: milestonePop 1.25s ease-out forwards;
          text-shadow: 0 6px 18px rgba(236, 72, 153, 0.35);
        }

        @keyframes floatHeart {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px) scale(1.06);
            opacity: 0.45;
          }
        }

        @keyframes partnerPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(255, 198, 224, 0.24);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(255, 198, 224, 0);
          }
        }

        @keyframes mergePulse {
          0%,
          100% {
            opacity: 0.28;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.82;
            transform: scaleX(1.08);
          }
        }

        @keyframes milestonePop {
          0% {
            transform: translateY(0) scale(0.9);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-24px) scale(1.08);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-heart,
          .pulse-dashed,
          .merge-line.connected,
          .milestone-heart {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
