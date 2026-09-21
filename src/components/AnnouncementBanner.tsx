"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";

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
    <div className="no-print bg-ink text-sm text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <p>The 2026 season is underway. Good luck out there.</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="-mr-1.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
