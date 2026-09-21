"use client";

import { useState } from "react";
import { usePlayer } from "@/lib/PlayerContext";
import { useToast } from "./ToastProvider";

export function WelcomeNamePrompt() {
  const { needsDisplayName, updateDisplayName } = usePlayer();
  const toast = useToast();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!needsDisplayName || dismissed) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await updateDisplayName(trimmed);
      toast.success(`Welcome, ${trimmed}!`);
    } catch (e) {
      setError("Couldn't save that name. Try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="no-print border-b border-line bg-sunk">
      <form
        onSubmit={save}
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6"
      >
        <label htmlFor="welcome-display-name" className="shrink-0 text-sm font-medium text-ink">
          Welcome! What should we call you?
        </label>
        <input
          id="welcome-display-name"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Display name"
          maxLength={40}
          aria-invalid={error ? true : undefined}
          className={`min-w-[10rem] flex-1 rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted ${
            error ? "border-loss" : "border-line focus:border-ink"
          }`}
        />
        <button
          type="submit"
          disabled={!value.trim() || saving}
          className="cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="cursor-pointer text-sm text-muted transition-colors hover:text-ink"
        >
          Skip for now
        </button>
        {error && (
          <p role="alert" className="w-full text-sm text-loss">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
