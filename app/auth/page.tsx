"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { hydrateLocalMemoryFromCloud } from "@/lib/memoryCloud";
import { DEPTH_MODE_STORAGE_KEY, type DepthMode } from "@/lib/depthMode";
import { updateMemory } from "@/lib/memory";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [phase, setPhase] = useState<"auth" | "onboarding">("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [readiness, setReadiness] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordPlaceholder = isLogin ? "Enter your password" : "Create a password";

  const canSubmit = useMemo(() => {
    if (phase === "onboarding") return !loading;
    return isValidEmail(email) && password.trim().length >= 6 && !loading;
  }, [email, password, loading]);

  function depthModeFromReadiness(value: number): DepthMode {
    if (value >= 8) return "steel";
    return "satin";
  }

  async function finishOnboarding() {
    setLoading(true);
    setError(null);
    try {
      const mode = depthModeFromReadiness(readiness);
      try {
        localStorage.setItem(DEPTH_MODE_STORAGE_KEY, mode);
      } catch {}
      try {
        updateMemory((m: any) => ({
          ...m,
          profile: {
            ...(m?.profile ?? {}),
            readiness,
            depthMode: mode,
            updatedAt: new Date().toISOString(),
          },
        }));
      } catch {}

      // Best effort: if signed in, make sure cloud memory is loaded (and bootstrap will upsert).
      await hydrateLocalMemoryFromCloud();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError("Auth is not configured yet.");
        return;
      }

      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
      }

      if (!isLogin) {
        setPhase("onboarding");
        return;
      }

      await hydrateLocalMemoryFromCloud();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-[#7b6aa8]/18 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-[#c9a87c]/14 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(47,47,47,0.05),transparent)]" />
      </div>

      <main className="relative w-full max-w-[420px]">
        <div className="luma-glass border border-white/10 p-7 md:p-9 shadow-[0_0_80px_rgba(100,80,160,0.12)]">
          <header className="text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-medium">Luma</p>
            <h1 className="mt-4 font-serif text-3xl tracking-tight [font-family:var(--font-serif-display)]">
              Luma
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
              Understand what&apos;s really happening between you
            </p>
          </header>

          {phase === "auth" ? (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[box-shadow,border-color,background] duration-200 focus:border-white/20 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(123,106,168,0.2)]"
                />
              </label>

              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordPlaceholder}
                  minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[box-shadow,border-color,background] duration-200 focus:border-white/20 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(201,168,124,0.15)]"
                />
              </label>

              {error && (
              <p className="text-xs text-[#b85d4a] text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-all duration-200 hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? "Please wait..." : "Continue"}
              </button>
            </form>
          ) : (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm text-foreground text-center">How ready are you to see things clearly?</p>

              <div className="mt-6">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={readiness}
                  onChange={(e) => setReadiness(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="mt-2 flex items-center justify-between text-[11px] text-white/55">
                  <span className="text-muted-foreground">1 — Satin</span>
                  <span className="text-muted-foreground">10 — Steel</span>
                </div>
                <p className="mt-4 text-xs text-white/60 text-center">
                  Luma adapts to how much honesty you&apos;re ready for.
                </p>
              </div>

              {error && (
                <p className="mt-4 text-xs text-[#b85d4a] text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={finishOnboarding}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-all duration-200 hover:opacity-95 disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? "Please wait..." : "Continue"}
              </button>
            </div>
          )}

          {phase === "auth" && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsLogin((v) => !v);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <span className="inline-block transition-all duration-200">
                  {isLogin ? "New here? Create account" : "Already have an account? Log in"}
                </span>
              </button>
            </div>
          )}

          <div
            aria-hidden
            className={`mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 ${loading ? "opacity-30" : "opacity-100"}`}
          />

          <p
            className="mt-5 text-center text-[11px] text-muted-foreground font-light transition-all duration-300"
          >
            Quiet, private, and designed for clarity.
          </p>
        </div>
      </main>
    </div>
  );
}

