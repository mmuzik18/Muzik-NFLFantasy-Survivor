import type { Schema } from "../../amplify/data/resource";
import { ResultBadge } from "./ResultBadge";

type Pick = Schema["Pick"]["type"];
type Player = Schema["Player"]["type"];

export function AdminPicksPanel({
  picks,
  players,
  onGrade,
  onDelete,
}: {
  picks: Pick[];
  players: Player[];
  onGrade: (pick: Pick, result: "WIN" | "LOSS") => void;
  onDelete: (pick: Pick) => void;
}) {
  const nameFor = (playerId: string) => players.find((p) => p.id === playerId)?.displayName ?? playerId;
  const sorted = [...picks].sort(
    (a, b) => b.week - a.week || nameFor(a.playerId).localeCompare(nameFor(b.playerId)),
  );

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-1">All picks</h2>
      <p className="text-xs text-ink-soft mb-3">
        Grade a pending pick, or delete one entirely — e.g. to reset a player who wants a clean
        slate. Deleting frees up that team and that week for them again.
      </p>
      {sorted.length === 0 ? (
        <p className="text-sm text-ink-soft">No picks yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.map((p) => (
            <li key={p.id} className="py-2.5 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm text-ink">
                Week {p.week} — <span className="text-ink-soft">{nameFor(p.playerId)}</span> — {p.team}
              </span>
              <span className="flex items-center gap-2">
                <ResultBadge result={p.result} />
                {!p.result && (
                  <>
                    <button
                      onClick={() => onGrade(p, "WIN")}
                      className="text-xs text-win border border-win rounded-md px-2 py-0.5 hover:bg-win-bg transition-colors cursor-pointer"
                    >
                      Win
                    </button>
                    <button
                      onClick={() => onGrade(p, "LOSS")}
                      className="text-xs text-loss border border-loss rounded-md px-2 py-0.5 hover:bg-loss-bg transition-colors cursor-pointer"
                    >
                      Loss
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(p)}
                  className="text-xs text-ink-soft border border-line rounded-md px-2 py-0.5 hover:border-loss hover:text-loss transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
