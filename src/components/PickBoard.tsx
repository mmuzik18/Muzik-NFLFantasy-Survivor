"use client";

import { useState } from "react";
import { CalendarBlank, CheckCircle, Lock, XCircle } from "@phosphor-icons/react";
import { formatQuarter, teamAbbreviation, type NormalizedGame } from "@/lib/espn";
import { useToast } from "./ToastProvider";

type Mode = "picking" | "watching" | "locked";
type PickResult = "WIN" | "LOSS" | string | null | undefined;

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

/** How a highlighted/selected row or tile should read: "win"/"loss" once
 * that pick's game is graded final, "pick" (plain ink) otherwise. */
type Tone = "pick" | "win" | "loss";

function toneOf(pickResult: PickResult): Tone {
  if (pickResult === "WIN") return "win";
  if (pickResult === "LOSS") return "loss";
  return "pick";
}

const ROW_TONE_CLASSES: Record<Tone, string> = {
  pick: "bg-sunk",
  win: "bg-win-soft",
  loss: "bg-loss-soft",
};

const TILE_TONE_CLASSES: Record<Tone, string> = {
  pick: "border-transparent ring-2 ring-ink",
  win: "border-transparent ring-2 ring-win",
  loss: "border-transparent ring-2 ring-loss",
};

function TeamRow({
  team,
  score,
  won,
  dim,
  clickable,
  used,
  selected,
  highlighted,
  tone,
  onClick,
}: {
  team: string;
  score: number | null;
  won: boolean;
  /** The game is final and this team lost: fade the name and score. */
  dim: boolean;
  clickable: boolean;
  used: boolean;
  selected: boolean;
  highlighted: boolean;
  tone: Tone;
  onClick: () => void;
}) {
  // A used team stays enabled while the board is otherwise pickable (not
  // `disabled`) so clicking it can surface an error instead of doing
  // nothing, see PickBoard's pickTeam. Outside picking mode there's
  // nothing to pick, so the row is disabled entirely.
  const active = clickable && !used;
  const marked = selected || highlighted;
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={onClick}
      aria-pressed={clickable ? selected : undefined}
      className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${
        marked
          ? ROW_TONE_CLASSES[tone]
          : active
            ? "cursor-pointer hover:bg-sunk active:translate-y-px"
            : used && clickable
              ? "cursor-not-allowed"
              : ""
      } ${used && clickable ? "opacity-45" : ""}`}
    >
      <span className="w-9 shrink-0 font-mono text-xs font-semibold text-muted">
        {teamAbbreviation(team)}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[15px] ${
          dim ? "text-muted" : won ? "font-semibold text-ink" : "text-ink"
        }`}
      >
        {team}
      </span>
      {used && clickable && <span className="shrink-0 text-xs text-muted">Used</span>}
      {marked &&
        (tone === "loss" ? (
          <XCircle size={20} weight="fill" className="shrink-0 text-loss" aria-hidden="true" />
        ) : (
          <CheckCircle
            size={20}
            weight="fill"
            className={`shrink-0 ${tone === "win" ? "text-win" : "text-ink"}`}
            aria-hidden="true"
          />
        ))}
      {highlighted && !selected && <span className="sr-only">Your pick</span>}
      <span
        className={`w-10 shrink-0 text-right font-display text-3xl leading-none font-bold tabular-nums ${
          dim ? "text-muted" : "text-ink"
        }`}
      >
        {score ?? ""}
      </span>
    </button>
  );
}

function GameTile({
  game,
  index,
  mode,
  usedTeams,
  selectedTeam,
  highlightTeam,
  pickResult,
  onPickTeam,
}: {
  game: NormalizedGame;
  index: number;
  mode: Mode;
  usedTeams: Set<string>;
  selectedTeam: string | null;
  highlightTeam: string | null;
  pickResult: PickResult;
  onPickTeam: (team: string) => void;
}) {
  const isFinal = game.status === "FINAL";
  const isLive = game.status === "IN_PROGRESS";
  const tileMarked = [game.awayTeam, game.homeTeam].includes(selectedTeam ?? highlightTeam ?? "");
  const tone = toneOf(pickResult);
  const lost = (team: string) => isFinal && game.winner !== null && game.winner !== team;

  return (
    <div
      style={{ "--i": Math.min(index, 12) } as React.CSSProperties}
      className={`animate-rise overflow-hidden rounded-md border bg-surface transition-shadow ${
        tileMarked ? TILE_TONE_CLASSES[tone] : "border-line"
      }`}
    >
      <div className="flex items-center justify-between border-b border-line px-3.5 py-2 text-xs">
        {isLive ? (
          <span className="flex items-center gap-1.5 font-medium text-loss">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-loss opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
            </span>
            <span className="tabular-nums">
              {game.period
                ? `${formatQuarter(game.period)}${game.displayClock ? ` ${game.displayClock}` : ""}`
                : game.statusDetail || "Live"}
            </span>
          </span>
        ) : isFinal ? (
          <span className="font-medium text-muted">Final</span>
        ) : (
          <span className="tabular-nums text-muted">{formatKickoff(game.startTime)}</span>
        )}
      </div>
      <div className="divide-y divide-line">
        <TeamRow
          team={game.awayTeam}
          score={game.awayScore}
          won={game.winner === game.awayTeam}
          dim={lost(game.awayTeam)}
          clickable={mode === "picking"}
          used={usedTeams.has(game.awayTeam)}
          selected={selectedTeam === game.awayTeam}
          highlighted={highlightTeam === game.awayTeam}
          tone={tone}
          onClick={() => onPickTeam(game.awayTeam)}
        />
        <TeamRow
          team={game.homeTeam}
          score={game.homeScore}
          won={game.winner === game.homeTeam}
          dim={lost(game.homeTeam)}
          clickable={mode === "picking"}
          used={usedTeams.has(game.homeTeam)}
          selected={selectedTeam === game.homeTeam}
          highlighted={highlightTeam === game.homeTeam}
          tone={tone}
          onClick={() => onPickTeam(game.homeTeam)}
        />
      </div>
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
  pickResult = null,
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
  /** The team already saved for this week, if any. While `mode` is
   * "picking" this pre-selects it and lets the player pick a different
   * team instead, right up until the week locks. */
  confirmedTeam?: string | null;
  /** The graded result ("WIN"/"LOSS", or null while pending) of the pick
   * being shown. Colors the highlighted team/tile green or red once its
   * game is final, instead of the plain "this is your pick" ink. */
  pickResult?: PickResult;
  onConfirm?: (team: string) => void;
  confirming?: boolean;
  loading?: boolean;
  statusMessage?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(confirmedTeam);
  const toast = useToast();
  const sorted = [...games].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // A team already assigned to this week isn't "used" from this board's
  // point of view: you're allowed to keep or re-pick it.
  const selectableUsedTeams =
    confirmedTeam !== null
      ? new Set([...usedTeams].filter((t) => t !== confirmedTeam))
      : usedTeams;

  function pickTeam(team: string) {
    if (mode !== "picking") return;
    if (selectableUsedTeams.has(team)) {
      toast.error(`${team} already chosen in a prior week. Choose a different team.`);
      return;
    }
    setSelected((cur) => (cur === team ? null : team));
  }

  const hasChange = selected !== null && selected !== confirmedTeam;

  return (
    <section aria-labelledby="matchups-heading">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="matchups-heading" className="text-[15px] font-semibold text-ink">
          Matchups
        </h2>
        {sorted.length > 0 && (
          <span className="text-sm tabular-nums text-muted">
            {sorted.length} {sorted.length === 1 ? "game" : "games"}
          </span>
        )}
      </div>

      {mode === "picking" && confirmedTeam && (
        <p className="mb-4 text-sm text-muted">
          Currently picked: <span className="font-medium text-ink">{confirmedTeam}</span>. You can
          change this any time before the first game of the week starts.
        </p>
      )}

      {mode === "locked" && (
        <p className="mb-4 flex items-start gap-2.5 rounded-md border border-line bg-surface px-3.5 py-3 text-sm text-muted">
          <Lock size={18} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            {statusMessage ??
              `The first game of week ${week} already kicked off and no pick was made in time.`}
          </span>
        </p>
      )}

      {loading && sorted.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label="Loading schedule">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="animate-skeleton h-[8.75rem] rounded-md bg-sunk" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-start gap-1.5 rounded-md border border-dashed border-line px-5 py-8">
          <CalendarBlank size={24} className="mb-1 text-muted" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">No games for week {week} yet</p>
          <p className="text-sm text-muted">
            The schedule shows up here as soon as ESPN publishes it.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((g, i) => (
            <GameTile
              key={g.espnEventId}
              game={g}
              index={i}
              mode={mode}
              usedTeams={selectableUsedTeams}
              selectedTeam={mode === "picking" ? selected : null}
              highlightTeam={mode !== "picking" ? highlightTeam : null}
              pickResult={pickResult}
              onPickTeam={pickTeam}
            />
          ))}
        </div>
      )}

      {mode === "picking" && (
        <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between gap-4 rounded-md border border-line bg-surface px-4 py-3 shadow-float">
          <p className="min-w-0 truncate text-sm text-muted" aria-live="polite">
            {selected ? (
              <>
                Selected: <span className="font-semibold text-ink">{selected}</span>
              </>
            ) : (
              "Tap a team to pick them"
            )}
          </p>
          <button
            type="button"
            disabled={!hasChange || confirming}
            onClick={() => selected && onConfirm?.(selected)}
            className="shrink-0 cursor-pointer whitespace-nowrap rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            {confirming ? "Saving..." : confirmedTeam ? "Update pick" : "Confirm pick"}
          </button>
        </div>
      )}
    </section>
  );
}
