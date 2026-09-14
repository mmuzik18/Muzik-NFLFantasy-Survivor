"use client";

import { useEffect, useState } from "react";

// Bump this id whenever the message changes, so a previously-dismissed
// banner reappears for a genuinely new announcement instead of staying
// hidden forever.
const BANNER_ID = "2026-season-kickoff";
const KEY = `muzik-survivor:dismissed-banner:${BANNER_ID}`;

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    (() => {
      try {
        setDismissed(localStorage.getItem(KEY) === "1");
      } catch {
        setDismissed(false);
      }
    })();
  }, []);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
  }

  return (
    <div className="no-print bg-gold text-ink text-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <p className="font-medium">🏈 The 2026 season is underway — good luck out there.</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 opacity-70 hover:opacity-100 cursor-pointer text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
