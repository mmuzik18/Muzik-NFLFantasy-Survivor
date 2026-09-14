"use client";

import { useEffect } from "react";

const KEY = "muzik-survivor:utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Captures first-touch UTM params from the URL into localStorage (never
 * sent anywhere — there's no analytics backend here, this just preserves
 * "who invited who" attribution for later, e.g. an admin wanting to know
 * which invite link brought someone in). Only the first landing counts:
 * an existing record is never overwritten by a later visit. */
export function useUtmCapture() {
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
      const params = new URLSearchParams(window.location.search);
      const captured: Record<string, string> = {};
      for (const key of UTM_PARAMS) {
        const value = params.get(key);
        if (value) captured[key] = value;
      }
      if (Object.keys(captured).length === 0) return;
      localStorage.setItem(KEY, JSON.stringify({ ...captured, capturedAt: new Date().toISOString() }));
    } catch {
      // Private browsing / blocked storage — attribution just isn't
      // recorded for this visit, nothing else depends on it.
    }
  }, []);
}
