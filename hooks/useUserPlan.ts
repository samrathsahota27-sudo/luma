"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type UserPlan = "free" | "premium";

function normalizePlan(value: unknown): UserPlan {
  if (value === "premium") return "premium";
  return "free";
}

export function useUserPlan() {
  const [plan, setPlan] = useState<UserPlan>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;
        if (error) {
          setPlan("free");
          return;
        }
        const user = data?.user ?? null;
        const rawPlan =
          (user as any)?.plan ??
          (user as any)?.user_metadata?.plan ??
          (user as any)?.app_metadata?.plan;
        setPlan(normalizePlan(rawPlan));
      } catch {
        if (!cancelled) setPlan("free");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plan, loading };
}

