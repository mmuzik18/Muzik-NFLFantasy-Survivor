"use client";

import { useState } from "react";
import type { Schema } from "../../amplify/data/resource";

type Player = Schema["Player"]["type"];

function PlayerRow({
  player,
  onUpdate,
}: {
  player: Player;
  onUpdate: (player: Player, isEliminated: boolean, eliminatedWeek: number | null) => void;
}) {
  const [week, setWeek] = useState(player.eliminatedWeek ?? 1);

  return (
    <li className="flex items-center justify-between gap-3 rounded-md px-2 py-2 transition-colors hover:bg-sunk">
      <span className="min-w-0 truncate text-sm text-ink">{player.displayName}</span>
      <div className="flex shrink-0 items-center gap-2">
        {player.isEliminated ? (
          <>
            <span className="text-sm text-loss">Out, week {player.eliminatedWeek}</span>
            <button
              onClick={() => onUpdate(player, false, null)}
              className="cursor-pointer rounded-md border border-win/40 px-2.5 py-1 text-xs font-medium text-win transition-colors hover:bg-win-soft"
            >
              Reinstate
            </button>
          </>
        ) : (
          <>
            <input
              type="number"
              min={1}
              max={18}
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              aria-label={`Elimination week for ${player.displayName}`}
              className="w-16 rounded-md border border-line bg-surface px-2 py-1 text-sm tabular-nums text-ink"
            />
            <button
              onClick={() => onUpdate(player, true, week)}
              className="cursor-pointer rounded-md border border-loss/40 px-2.5 py-1 text-xs font-medium text-loss transition-colors hover:bg-loss-soft"
            >
              Eliminate
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function AdminPlayersPanel({
  players,
  onUpdate,
}: {
  players: Player[];
  onUpdate: (player: Player, isEliminated: boolean, eliminatedWeek: number | null) => void;
}) {
  return (
    <section aria-labelledby="admin-players-heading">
      <h2 id="admin-players-heading" className="text-[15px] font-semibold text-ink">
        Players
      </h2>
      <p className="mt-1 mb-4 max-w-[64ch] text-sm leading-relaxed text-muted">
        Manual override. Normal elimination happens automatically when a pick is graded.
      </p>
      {players.length === 0 ? (
        <p className="text-sm text-muted">No players yet.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} onUpdate={onUpdate} />
          ))}
        </ul>
      )}
    </section>
  );
}
