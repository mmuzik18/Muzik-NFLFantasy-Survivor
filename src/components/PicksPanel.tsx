import type { PickWithGame } from "@/lib/gameDisplay";
import { ResultBadge } from "./ResultBadge";

export function PicksPanel({ picks }: { picks: PickWithGame[] }) {
  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-4">Pick history</h2>

      {picks.length === 0 ? (
        <p className="text-sm text-ink-soft">No decided picks yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {picks.map(({ pick, game, opponent, pickScore, opponentScore }) => (
            <li key={pick.id} className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">
                  Week {pick.week} — {pick.team}
                </p>
                {game ? (
                  <p className="text-xs text-ink-soft">
                    {opponent ? `vs ${opponent}` : ""}
                    {pickScore !== null && opponentScore !== null
                      ? ` · ${pickScore}-${opponentScore}`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs text-ink-soft">Game not synced yet</p>
                )}
              </div>
              <ResultBadge result={pick.result} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
