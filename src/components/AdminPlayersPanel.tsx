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
    <li className="py-2.5 px-2 -mx-2 rounded-md flex items-center justify-between gap-3 transition-colors hover:bg-background">
      <span className="text-sm text-ink">{player.displayName}</span>
      <div className="flex items-center gap-2">
        {player.isEliminated ? (
          <>
            <span className="text-xs text-loss">Out — Week {player.eliminatedWeek}</span>
            <button
              onClick={() => onUpdate(player, false, null)}
              className="text-xs border border-win text-win rounded-md px-2 py-1 hover:bg-win-bg transition-colors cursor-pointer"
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
              className="w-14 rounded-md border border-line bg-background px-1.5 py-0.5 text-xs text-ink"
            />
            <button
              onClick={() => onUpdate(player, true, week)}
              className="text-xs border border-loss text-loss rounded-md px-2 py-1 hover:bg-loss-bg transition-colors cursor-pointer"
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
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-1">Players</h2>
      <p className="text-xs text-ink-soft mb-3">
        Manual override — normal elimination happens automatically when a pick is graded.
      </p>
      {players.length === 0 ? (
        <p className="text-sm text-ink-soft">No players yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} onUpdate={onUpdate} />
          ))}
        </ul>
      )}
    </section>
  );
}
