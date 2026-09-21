import type { Schema } from "../../amplify/data/resource";

type Player = Schema["Player"]["type"];
type Record = { wins: number; losses: number };

export function StandingsPanel({
  players,
  records,
  meId,
}: {
  players: Player[];
  records: Map<string, Record>;
  /** The signed-in player's id, so their own row can be marked. */
  meId?: string;
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

  // Players with an identical record share a rank (1, 2, 2, 4). Eliminated
  // players sit below everyone and aren't ranked.
  const ranks = new Map<string, number>();
  let position = 0;
  let rank = 0;
  let previous: Record | null = null;
  for (const p of sorted) {
    if (p.isEliminated) continue;
    position += 1;
    const r = recordFor(p.id);
    if (!previous || previous.wins !== r.wins || previous.losses !== r.losses) rank = position;
    ranks.set(p.id, rank);
    previous = r;
  }

  return (
    <section aria-labelledby="standings-heading">
      <h2 id="standings-heading" className="mb-3 text-[15px] font-semibold text-ink">
        Standings
      </h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted">No players yet.</p>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {sorted.map((p) => {
            const r = recordFor(p.id);
            const isMe = p.id === meId;
            return (
              <li
                key={p.id}
                className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-2 rounded-md px-2 py-2 ${
                  isMe ? "bg-sunk" : ""
                }`}
              >
                <span className="font-display text-xl leading-none font-semibold tabular-nums text-muted">
                  {ranks.get(p.id) ?? ""}
                </span>
                <span className={`truncate text-sm text-ink ${isMe ? "font-semibold" : ""}`}>
                  {p.displayName}
                  {isMe && <span className="ml-2 text-xs font-normal text-muted">You</span>}
                </span>
                {p.isEliminated ? (
                  <span className="text-sm text-loss">Out, week {p.eliminatedWeek}</span>
                ) : (
                  <span
                    className="font-display text-xl leading-none font-bold tabular-nums text-ink"
                    aria-label={`${r.wins} ${r.wins === 1 ? "win" : "wins"}, ${r.losses} ${r.losses === 1 ? "loss" : "losses"}`}
                  >
                    {r.wins}
                    <span className="text-muted">-{r.losses}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
