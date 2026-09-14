import type { Schema } from "../../amplify/data/resource";

type Player = Schema["Player"]["type"];
type Record = { wins: number; losses: number };

export function StandingsPanel({
  players,
  records,
}: {
  players: Player[];
  records: Map<string, Record>;
}) {
  const recordFor = (id: string): Record => records.get(id) ?? { wins: 0, losses: 0 };

  const sorted = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    const ra = recordFor(a.id);
    const rb = recordFor(b.id);
    if (rb.wins !== ra.wins) return rb.wins - ra.wins;
    if (ra.losses !== rb.losses) return ra.losses - rb.losses;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-4">Standings</h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-soft">No players yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.map((p) => {
            const r = recordFor(p.id);
            return (
              <li
                key={p.id}
                className="py-2.5 px-2 -mx-2 rounded-md flex items-center justify-between transition-colors hover:bg-background"
              >
                <span className="text-sm text-ink">{p.displayName}</span>
                {p.isEliminated ? (
                  <span className="text-xs font-medium text-loss">
                    Out — Week {p.eliminatedWeek}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-ink-soft tabular-nums">
                    <span className="text-win">{r.wins}</span>-<span className="text-loss">{r.losses}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
