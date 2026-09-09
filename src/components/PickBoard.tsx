"use client";

import { useState } from "react";
import { formatQuarter, type NormalizedGame } from "@/lib/espn";

type Mode = "picking" | "watching" | "locked";

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

function TeamRow({
  team,
  score,
  won,
  clickable,
  used,
  selected,
  highlighted,
  onClick,
}: {
  team: string;
  score: number | null;
  won: boolean;
  clickable: boolean;
  used: boolean;
  selected: boolean;
  highlighted: boolean;
  onClick: () => void;
}) {
  const active = clickable && !used;
  return (
    <button
      type="button"
      disabled={!active}
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
        selected || highlighted
          ? "bg-gold/20 ring-1 ring-inset ring-gold"
          : active
            ? "hover:bg-background cursor-pointer"
            : ""
      } ${used && clickable ? "opacity-40" : ""}`}
    >
      <span className={`text-sm ${won ? "font-semibold text-ink" : "text-ink-soft"}`}>
        {team}
        {used && clickable ? " (used)" : ""}
      </span>
      <span className={`font-score text-lg tabular-nums ${won ? "text-ink" : "text-ink-soft"}`}>
        {score ?? "-"}
      </span>
    </button>
  );
}

function GameCard({
  game,
  mode,
  usedTeams,
  selectedTeam,
  highlightTeam,
  onPickTeam,
}: {
  game: NormalizedGame;
  mode: Mode;
  usedTeams: Set<string>;
  selectedTeam: string | null;
  highlightTeam: string | null;
  onPickTeam: (team: string) => void;
}) {
  const isFinal = game.status === "FINAL";
  const isLive = game.status === "IN_PROGRESS";
  const cardHighlighted = [game.awayTeam, game.homeTeam].includes(selectedTeam ?? highlightTeam ?? "");

  return (
    <div
      className={`rounded-lg border bg-card px-4 py-3 transition-colors ${
        cardHighlighted ? "border-gold ring-1 ring-gold" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${
            isLive ? "text-loss" : "text-ink-soft"
          }`}
        >
          {isLive && (
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
            </span>
          )}
          {isLive
            ? game.period
              ? `${formatQuarter(game.period)}${game.displayClock ? ` · ${game.displayClock}` : ""}`
              : game.statusDetail || "Live"
            : isFinal
              ? "Final"
              : formatKickoff(game.startTime)}
        </span>
      </div>
      <TeamRow
        team={game.awayTeam}
        score={game.awayScore}
        won={game.winner === game.awayTeam}
        clickable={mode === "picking"}
        used={usedTeams.has(game.awayTeam)}
        selected={selectedTeam === game.awayTeam}
        highlighted={highlightTeam === game.awayTeam}
        onClick={() => onPickTeam(game.awayTeam)}
      />
      <TeamRow
        team={game.homeTeam}
        score={game.homeScore}
        won={game.winner === game.homeTeam}
        clickable={mode === "picking"}
        used={usedTeams.has(game.homeTeam)}
        selected={selectedTeam === game.homeTeam}
        highlighted={highlightTeam === game.homeTeam}
        onClick={() => onPickTeam(game.homeTeam)}
      />
    </div>
  );
}

export function PickBoard({
  week,
  games,
  mode,
  usedTeams,
  highlightTeam = null,
  confirmedTeam = null,
  onConfirm,
  confirming = false,
  loading = false,
  statusMessage,
}: {
  week: number;
  games: NormalizedGame[];
  mode: Mode;
  usedTeams: Set<string>;
  highlightTeam?: string | null;
  /** The team already saved for this week, if any — while `mode` is
   * "picking" this pre-selects it and lets the player pick a different
   * team instead, right up until the week locks. */
  confirmedTeam?: string | null;
  onConfirm?: (team: string) => void;
  confirming?: boolean;
  loading?: boolean;
  statusMessage?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(confirmedTeam);
  const sorted = [...games].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // A team already assigned to this week isn't "used" from this board's
  // point of view — you're allowed to keep or re-pick it.
  const selectableUsedTeams =
    confirmedTeam !== null
      ? new Set([...usedTeams].filter((t) => t !== confirmedTeam))
      : usedTeams;

  function pickTeam(team: string) {
    if (mode !== "picking" || selectableUsedTeams.has(team)) return;
    setSelected((cur) => (cur === team ? null : team));
  }

  const hasChange = selected !== null && selected !== confirmedTeam;

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="font-display uppercase tracking-wide text-ink text-lg">
          Week {week} {mode === "picking" ? "matchups" : mode === "locked" ? "— locked" : ""}
        </h2>
        {mode === "picking" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-soft">
              {selected ? `Selected: ${selected}` : "Tap a team to pick them"}
            </span>
            <button
              type="button"
              disabled={!hasChange || confirming}
              onClick={() => selected && onConfirm?.(selected)}
              className="bg-gold text-ink font-semibold rounded-md px-4 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-soft transition-colors cursor-pointer"
            >
              {confirming ? "Saving..." : confirmedTeam ? "Update pick" : "Confirm pick"}
            </button>
          </div>
        )}
      </div>

      {mode === "picking" && confirmedTeam && (
        <p className="text-xs text-ink-soft mb-4">
          Currently picked: <span className="font-medium text-ink">{confirmedTeam}</span> — you can
          change this any time before the first game of the week starts.
        </p>
      )}

      {mode === "locked" && (
        <p className="text-sm text-pending mb-4">
          {statusMessage ??
            `The first game of week ${week} already kicked off and no pick was made in time.`}
        </p>
      )}

      {loading && sorted.length === 0 ? (
        <p className="text-sm text-ink-soft">Loading schedule...</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-soft">No games found for week {week} yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sorted.map((g) => (
            <GameCard
              key={g.espnEventId}
              game={g}
              mode={mode}
              usedTeams={selectableUsedTeams}
              selectedTeam={mode === "picking" ? selected : null}
              highlightTeam={mode !== "picking" ? highlightTeam : null}
              onPickTeam={pickTeam}
            />
          ))}
        </div>
      )}
    </section>
  );
}
