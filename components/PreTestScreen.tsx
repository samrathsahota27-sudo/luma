"use client";

import { useEffect, useState } from "react";

export default function PreTestScreen({
  onContinue,
  email,
  onEmailChange,
}: {
  onContinue: () => void;
  email?: string;
  onEmailChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 20);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* BACKGROUND IMAGE */}
      <img
        src="/t.jpg"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover object-left opacity-90"
        loading="eager"
        decoding="async"
      />

      {/* Very light global darkness (keeps image visible) */}
      <div aria-hidden className="absolute inset-0 bg-black/10 z-10" />

      {/* CONTENT (CENTERED) */}
      <div className="relative z-20 min-h-screen flex items-center justify-center h-full px-6 text-white">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-8 max-w-md w-full text-center shadow-lg">
          <div className="w-2 h-2 rounded-full bg-white/70 mb-6 mx-auto" />

          <h1 className="text-3xl font-medium text-white mb-4">
            Take a moment.
          </h1>

          <p className="text-sm text-white/90 mb-6 leading-relaxed">
            This experience works best when you follow what quietly draws your attention.
          </p>

          <button
            onClick={onContinue}
            className="px-6 py-3 bg-white text-black rounded-full text-sm transition-transform duration-200 hover:scale-[1.02] shadow-md"
          >
            Begin
          </button>

          <div className="mt-10">
            <div className="text-xs text-white/70 tracking-widest mb-3">
              WHAT HAPPENS NEXT
            </div>

            <div className="text-sm text-white/85 space-y-2 max-w-sm mx-auto">
              <p>You&apos;ll choose images that feel right to you.</p>
              <p>You can also add a short thought if you want.</p>
              <p>Your honest input helps create a deeper result.</p>
              <p className="mt-3">
                Using your own words is optional, but it helps us give you a more accurate result.
              </p>
            </div>

            <input
              type="email"
              value={email ?? ""}
              onChange={(e) => onEmailChange?.(e.target.value)}
              placeholder="Email me a reminder (optional)"
              className="w-full max-w-sm mx-auto mt-6 p-3 rounded-lg border border-white/20 text-sm bg-white/10 text-white placeholder:text-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            <p className="text-xs text-white/60 mt-2">
              If you leave before finishing, we can remind you to come back.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

