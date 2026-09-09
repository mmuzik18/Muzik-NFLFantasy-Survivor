"use client";

import { useEffect, useRef, useState } from "react";

const COMMISSIONER_EMAIL = "mmuzik18@gmail.com";

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="no-print fixed bottom-5 left-5 z-40">
      {open && (
        <div className="absolute bottom-12 left-0 w-56 rounded-lg border border-line bg-card shadow-[var(--shadow-card)] p-3.5">
          <p className="text-sm font-medium text-ink mb-1">Questions about the pool?</p>
          <p className="text-xs text-ink-soft mb-3">Reach the commissioner directly.</p>
          <a
            href={`mailto:${COMMISSIONER_EMAIL}?subject=Muzik%20NFL%20Survivor`}
            className="inline-block text-sm text-gold hover:text-gold-soft transition-colors"
          >
            {COMMISSIONER_EMAIL}
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Contact the commissioner"
        aria-expanded={open}
        title="Contact the commissioner"
        className="w-10 h-10 rounded-full bg-field border border-gold/40 text-gold-soft shadow-[var(--shadow-card)] flex items-center justify-center hover:border-gold hover:text-gold transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
