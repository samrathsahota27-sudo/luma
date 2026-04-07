"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const validate = () => {
    const e = email.trim();
    if (!e.includes("@")) return "Please enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (isSignup && password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) {
          setError(signUpError.message || "Could not create account.");
          return;
        }
        setSuccess("Check your email to confirm your account");
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "Could not sign in.");
        return;
      }

      if (data?.user) router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_50%_at_50%_0%,rgba(140,110,200,0.22),transparent_72%),radial-gradient(ellipse_56%_44%_at_100%_85%,rgba(90,130,200,0.14),transparent_72%),radial-gradient(ellipse_48%_38%_at_0%_70%,rgba(120,80,140,0.1),transparent_70%)]"
      />

      <main className="relative z-10 px-6">
        <div className="mx-auto mt-20 w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-center font-serif text-xl tracking-tight text-white/95 [font-family:var(--font-serif-display)]">
            Luma
          </p>
          <p className="mt-3 text-center text-sm text-white/60">Your reflection. Your history. Your mirror.</p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                !isSignup ? "bg-white text-[#0b0a0d] font-medium" : "text-white/65 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm transition ${
                isSignup ? "bg-white text-[#0b0a0d] font-medium" : "text-white/65 hover:text-white"
              }`}
            >
              Create account
            </button>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white w-full mb-3 focus:outline-none focus:border-white/30 placeholder:text-white/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white w-full mb-3 focus:outline-none focus:border-white/30 placeholder:text-white/30"
            />
            {isSignup ? (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white w-full mb-3 focus:outline-none focus:border-white/30 placeholder:text-white/30"
              />
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-white text-[#0b0a0d] text-base font-medium transition-opacity hover:opacity-90 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(120,90,180,0.2)] disabled:opacity-60"
            >
              {loading ? "..." : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}
          {success ? <p className="text-emerald-300 text-sm mt-2">{success}</p> : null}

          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError("");
              setSuccess("");
            }}
            className="mt-4 text-sm text-white/60 hover:text-white/85 transition"
          >
            {isSignup ? "Already have an account? Sign in \u2192" : "Don't have an account? Create one \u2192"}
          </button>

          <p className="text-white/20 text-xs text-center mt-6">Luma keeps your data private. No sharing, no ads.</p>
        </div>
      </main>
    </div>
  );
}
