"use client";

import { useEffect } from "react";
import { hydrateLocalMemoryFromCloud, saveMemoryForCurrentUser } from "@/lib/memoryCloud";
import { getMemory } from "@/lib/memory";

/**
 * On app load:
 * - If user is signed in, hydrate `luma_memory` from Supabase.
 * - Then push local memory up (so first-time users create a row).
 */
export function MemoryBootstrap() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await hydrateLocalMemoryFromCloud();
      if (cancelled) return;
      if (res?.ok) {
        // Ensure the server row exists / stays updated.
        await saveMemoryForCurrentUser(getMemory());
      }
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

