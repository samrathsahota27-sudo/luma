"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getMemory } from "@/lib/memory";
import { getIndividualReflections } from "@/lib/reflectionStorage";
import {
  recordAppVisit,
  shouldShowInactivityReminderNow,
  snoozeInactivityReminder,
} from "@/lib/inactivityReminder";
import {
  shouldShowPatternRepeatReminderNow,
  snoozePatternRepeatReminder,
} from "@/lib/patternRepeatReminder";

const SESSION_EVAL_KEY = "luma_inactivity_session_evaluated";

/** Routes where we only ping activity and never surface messages. */
const NO_MESSAGE_PREFIXES = ["/auth", "/login"];

function shouldSuppressMessages(pathname: string | null) {
  if (!pathname) return true;
  return NO_MESSAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function SoftMessageCard({
  message,
  onDismiss,
  dismissLabel,
}: {
  message: string;
  onDismiss: () => void;
  dismissLabel: string;
}) {
  return (
    <div className="w-full rounded-xl border border-white/[0.1] bg-[#121014]/88 px-3.5 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-4">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <p className="min-w-0 flex-1 text-left text-[0.9375rem] leading-snug text-white/[0.88] sm:text-[0.95rem] sm:leading-relaxed">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45"
          aria-label={dismissLabel}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/**
 * Soft re-engagement: inactivity (3–5d, stable per browser) and grounded pattern-repeat hints.
 * Fixed below the nav; compact for mobile without scrolling.
 */
export function InactivityReminderBanner() {
  const pathname = usePathname();
  const [showInactivity, setShowInactivity] = useState(false);
  const [showPattern, setShowPattern] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    let alreadyEvaluated = false;
    try {
      alreadyEvaluated = sessionStorage.getItem(SESSION_EVAL_KEY) === "1";
    } catch {
      alreadyEvaluated = false;
    }

    if (!alreadyEvaluated) {
      try {
        sessionStorage.setItem(SESSION_EVAL_KEY, "1");
      } catch {
        /* ignore */
      }
      const suppress = shouldSuppressMessages(pathname);
      const isCoupleHub = pathname === "/couple-hub";
      const inactive = !suppress && !isCoupleHub && shouldShowInactivityReminderNow();
      let pattern = false;
      if (!suppress && !isCoupleHub) {
        try {
          const memory = getMemory() as Record<string, unknown> | null;
          const indiv = getIndividualReflections();
          pattern = shouldShowPatternRepeatReminderNow(memory, indiv);
        } catch {
          pattern = false;
        }
      }
      recordAppVisit();
      if (inactive) setShowInactivity(true);
      if (pattern) setShowPattern(true);
    } else {
      recordAppVisit();
    }
  }, [pathname]);

  const dismissInactivity = () => {
    snoozeInactivityReminder(7);
    setShowInactivity(false);
  };

  const dismissPattern = () => {
    snoozePatternRepeatReminder(7);
    setShowPattern(false);
  };

  if (!showInactivity && !showPattern) return null;

  return (
    <div
      className="pointer-events-none fixed top-[4.25rem] left-0 right-0 z-[45] flex justify-center px-3 sm:top-[4.5rem] md:px-4"
      role="region"
      aria-label="Gentle reminders"
    >
      <div className="pointer-events-auto flex w-full max-w-lg flex-col gap-2">
        {showInactivity ? (
          <div role="status" aria-live="polite">
            <SoftMessageCard
              message={"You haven't checked in recently. Has something shifted?"}
              onDismiss={dismissInactivity}
              dismissLabel="Dismiss check-in reminder"
            />
          </div>
        ) : null}
        {showPattern ? (
          <div role="status" aria-live="polite">
            <SoftMessageCard
              message="This pattern is appearing again."
              onDismiss={dismissPattern}
              dismissLabel="Dismiss pattern reminder"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
