"use client";

import { useState } from "react";
import { usePlayer } from "@/lib/PlayerContext";

export function WelcomeNamePrompt() {
  const { needsDisplayName, updateDisplayName } = usePlayer();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!needsDisplayName || dismissed) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await updateDisplayName(trimmed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gold/10 border-b border-gold/40">
      <form
        onSubmit={save}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2.5"
      >
        <span className="text-sm text-ink font-medium shrink-0">
          Welcome! What should we call you?
        </span>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Display name"
          maxLength={40}
          className="flex-1 min-w-[140px] text-sm rounded-md border border-line bg-card px-2 py-1.5 text-ink focus:outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={!value.trim() || saving}
          className="bg-gold text-ink text-sm font-semibold rounded-md px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-soft transition-colors cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-xs text-ink-soft hover:text-ink transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
