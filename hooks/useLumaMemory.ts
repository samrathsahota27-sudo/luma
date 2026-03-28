"use client";

import { useEffect, useState } from "react";
import { getMemory } from "@/lib/memory";

export function useLumaMemory() {
  // IMPORTANT: keep initial render identical on server + client.
  // We only read localStorage after mount to avoid hydration mismatches.
  const [memory, setMemory] = useState<ReturnType<typeof getMemory>>(null);

  useEffect(() => {
    setMemory(getMemory());

    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce?.detail) {
        setMemory(ce.detail);
        return;
      }
      setMemory(getMemory());
    };

    window.addEventListener("luma_memory_updated", handler as EventListener);
    window.addEventListener("storage", handler as EventListener);
    return () => {
      window.removeEventListener("luma_memory_updated", handler as EventListener);
      window.removeEventListener("storage", handler as EventListener);
    };
  }, []);

  return memory;
}

