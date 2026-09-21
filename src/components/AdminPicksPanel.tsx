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
    <section aria-labelledby="admin-picks-heading">
      <h2 id="admin-picks-heading" className="text-[15px] font-semibold text-ink">
        All picks
      </h2>
      <p className="mt-1 mb-4 max-w-[64ch] text-sm leading-relaxed text-muted">
        Pending picks are graded automatically once their game goes final, so there&apos;s no need
        to grade by hand. The Win and Loss buttons are a manual override for edge cases, such as a
        game ESPN never marks final. Deleting a pick clears it entirely, which frees up that team
        and that week for the player again.
      </p>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No picks yet.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {sorted.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-md px-2 py-2 transition-colors hover:bg-sunk"
            >
              <span className="flex min-w-0 items-baseline gap-3 text-sm">
                <span className="w-7 shrink-0 font-display text-xl leading-none font-semibold tabular-nums text-muted">
                  {p.week}
                </span>
                <span className="min-w-0">
                  <span className="font-medium text-ink">{nameFor(p.playerId)}</span>
                  <span className="text-muted">, {p.team}</span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                <ResultBadge result={p.result} />
                {!p.result && (
                  <>
                    <button
                      onClick={() => onGrade(p, "WIN")}
                      className="cursor-pointer rounded-md border border-win/40 px-2.5 py-1 text-xs font-medium text-win transition-colors hover:bg-win-soft"
                    >
                      Win
                    </button>
                    <button
                      onClick={() => onGrade(p, "LOSS")}
                      className="cursor-pointer rounded-md border border-loss/40 px-2.5 py-1 text-xs font-medium text-loss transition-colors hover:bg-loss-soft"
                    >
                      Loss
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(p)}
                  className="cursor-pointer rounded-md border border-line px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-loss/40 hover:text-loss"
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
