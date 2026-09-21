"use client";

import { usePlayer } from "@/lib/PlayerContext";

export function PlayerErrorBanner() {
  const { error } = usePlayer();
  if (!error) return null;

  return (
    <div className="no-print mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <p role="alert" className="rounded-md border border-loss/30 bg-loss-soft px-3 py-2 text-sm text-loss">
        Couldn&apos;t load your player profile: {error}
      </p>
    </div>
  );
}
