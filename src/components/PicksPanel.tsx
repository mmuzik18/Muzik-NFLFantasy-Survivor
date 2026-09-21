import type { PickWithGame } from "@/lib/gameDisplay";
import { ResultBadge } from "./ResultBadge";

export function PicksPanel({ picks }: { picks: PickWithGame[] }) {
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="mb-3 text-[15px] font-semibold text-ink">
        Pick history
      </h2>

      {picks.length === 0 ? (
        <p className="text-sm text-muted">
          No decided picks yet. Graded picks show up here once your games go final.
        </p>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {picks.map(({ pick, game, opponent, pickScore, opponentScore }) => (
            <li
              key={pick.id}
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2"
            >
              <span className="font-display text-xl leading-none font-semibold tabular-nums text-muted">
                {pick.week}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{pick.team}</p>
                <p className="truncate text-xs text-muted">
                  {game
                    ? `${pickScore !== null && opponentScore !== null ? `${pickScore}-${opponentScore} ` : ""}${opponent ? `vs ${opponent}` : ""}`.trim()
                    : "Game not synced yet"}
                </p>
              </div>
              <ResultBadge result={pick.result} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
