"use client";

import { useState } from "react";
import type { NormalizedGame } from "@/lib/espn";
import { useLiveScores } from "@/lib/useLiveScores";
import { currentNflSeason, currentNflWeekGuess } from "@/lib/nflWeek";

function formatKickoff(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function GameCard({ game }: { game: NormalizedGame }) {
  const isFinal = game.status === "FINAL";
  const isLive = game.status === "IN_PROGRESS";

  return (
    <div className="rounded-lg border border-line bg-card px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isLive ? "text-loss" : "text-ink-soft"}`}>
          {isLive ? (game.statusDetail || "Live") : isFinal ? "Final" : formatKickoff(game.startTime)}
        </span>
      </div>
      <TeamRow team={game.awayTeam} score={game.awayScore} won={game.winner === game.awayTeam} />
      <TeamRow team={game.homeTeam} score={game.homeScore} won={game.winner === game.homeTeam} />
    </div>
  );
}

function TeamRow({
  team,
  score,
  won,
}: {
  team: string;
  score: number | null;
  won: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`text-sm ${won ? "font-semibold text-ink" : "text-ink-soft"}`}>{team}</span>
      <span className={`font-score text-lg tabular-nums ${won ? "text-ink" : "text-ink-soft"}`}>
        {score ?? "-"}
      </span>
    </div>
  );
}

export function Scoreboard() {
  const now = new Date();
  const [week, setWeek] = useState(() => currentNflWeekGuess(now));
  // ESPN's scoreboard feed only ever serves the current season regardless
  // of the year requested (verified directly against the endpoint), so
  // there's no working "browse a past season" feature to expose here —
  // season is fixed to the current one and only week is user-selectable.
  const season = currentNflSeason(now);
  const { games, loading, error } = useLiveScores(week, season);
  const sorted = [...games].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="font-display uppercase tracking-wide text-ink text-lg">Scoreboard</h2>
          <span className="text-[10px] text-ink-soft uppercase tracking-wide">
            Live from ESPN &middot; updates every 30s
          </span>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Week
          <input
            type="number"
            min={1}
            max={18}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="w-16 rounded-md border border-line bg-background px-2 py-1 text-ink"
          />
        </label>
      </div>

      {loading && games.length === 0 && <p className="text-sm text-ink-soft">Loading schedule...</p>}
      {error && (
        <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2 mb-3">
          Couldn&apos;t reach ESPN: {error}
        </p>
      )}
      {!loading && !error && sorted.length === 0 && (
        <p className="text-sm text-ink-soft">No games found for week {week}.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map((g) => (
          <GameCard key={g.espnEventId} game={g} />
        ))}
      </div>
    </section>
  );
}
