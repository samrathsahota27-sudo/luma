"use client";

import { useCallback, useEffect, useState } from "react";
import { type DepthMode, normalizeDepthMode, DEPTH_MODE_STORAGE_KEY } from "@/lib/depthMode";

export function useDepthMode() {
  const [depthMode, setDepthModeState] = useState<DepthMode>("balanced");

  useEffect(() => {
    try {
      setDepthModeState(normalizeDepthMode(localStorage.getItem(DEPTH_MODE_STORAGE_KEY)));
    } catch {
      /* ignore */
    }
  }, []);

  const setDepthMode = useCallback((mode: DepthMode) => {
    setDepthModeState(mode);
    try {
      localStorage.setItem(DEPTH_MODE_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  return { depthMode, setDepthMode };
}
