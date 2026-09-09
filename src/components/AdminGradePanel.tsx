import type { Schema } from "../../amplify/data/resource";

type Pick = Schema["Pick"]["type"];

export function AdminGradePanel({
  pendingPicks,
  onGrade,
}: {
  pendingPicks: Pick[];
  onGrade: (pick: Pick, result: "WIN" | "LOSS") => void;
}) {
  return (
    <section className="rounded-xl border border-dashed border-gold/50 bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-display uppercase tracking-wide text-ink text-lg">Commissioner</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gold-soft bg-gold/15 rounded-full px-2 py-0.5">
          Admins only
        </span>
      </div>
      <p className="text-xs text-ink-soft mb-3">
        Picks are graded automatically when{" "}
        <code className="bg-background px-1 py-0.5 rounded">npm run sync-scores</code> syncs a final
        score. Use this only to correct a mistake or grade a pick manually.
      </p>
      {pendingPicks.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing pending.</p>
      ) : (
        <ul className="divide-y divide-line">
          {pendingPicks.map((p) => (
            <li key={p.id} className="py-2 flex items-center justify-between">
              <span className="text-sm text-ink">
                Week {p.week} — {p.team}
              </span>
              <span className="flex gap-2">
                <button
                  onClick={() => onGrade(p, "WIN")}
                  className="text-win border border-win rounded-md px-2 py-0.5 text-xs hover:bg-win-bg transition-colors cursor-pointer"
                >
                  Win
                </button>
                <button
                  onClick={() => onGrade(p, "LOSS")}
                  className="text-loss border border-loss rounded-md px-2 py-0.5 text-xs hover:bg-loss-bg transition-colors cursor-pointer"
                >
                  Loss
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
