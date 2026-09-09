import type { Schema } from "../../amplify/data/resource";

type Player = Schema["Player"]["type"];

export function StandingsPanel({ players }: { players: Player[] }) {
  const sorted = [...players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    return a.displayName.localeCompare(b.displayName);
  });
  const aliveCount = players.filter((p) => !p.isEliminated).length;

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display uppercase tracking-wide text-ink text-lg">Standings</h2>
        <span className="text-xs text-ink-soft">
          {aliveCount} of {players.length} alive
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-soft">No players yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {sorted.map((p) => (
            <li key={p.id} className="py-2.5 flex items-center justify-between">
              <span className="text-sm text-ink flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${p.isEliminated ? "bg-loss" : "bg-win"}`}
                  aria-hidden="true"
                />
                {p.displayName}
              </span>
              <span className={`text-xs font-medium ${p.isEliminated ? "text-loss" : "text-win"}`}>
                {p.isEliminated ? `Out — Week ${p.eliminatedWeek}` : "Alive"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
