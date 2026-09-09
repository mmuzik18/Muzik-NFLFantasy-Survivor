"use client";

import { useEffect, useState } from "react";

/**
 * Current time as state, ticking every `intervalMs`. Reading `Date.now()`
 * directly during render is impure (React flags it — see the rules-of-react
 * purity rule), so anything that needs "now" for a render decision should
 * go through this instead. Returns null until mounted, so server-rendered
 * and first-hydration output stay deterministic.
 */
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Deferred via setTimeout(0) rather than called synchronously here —
    // React's set-state-in-effect rule wants setState reached from a
    // callback, not the effect body itself, even for a "prime it once on
    // mount" first read.
    const primeTimer = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(primeTimer);
      clearInterval(id);
    };
  }, [intervalMs]);

  return now;
}
