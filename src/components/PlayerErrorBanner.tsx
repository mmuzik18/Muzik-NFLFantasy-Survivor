"use client";

import { usePlayer } from "@/lib/PlayerContext";

export function PlayerErrorBanner() {
  const { error } = usePlayer();
  if (!error) return null;

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-4">
      <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2">
        Couldn&apos;t load your player profile: {error}
      </p>
    </div>
  );
}
