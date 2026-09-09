"use client";

import { useLiveScores, firstKickoff } from "@/lib/useLiveScores";
import { currentNflSeason } from "@/lib/nflWeek";
import { useNow } from "@/lib/useNow";

type Props = {
  week: number;
  team: string;
  onTeamChange: (team: string) => void;
  availableTeams: readonly string[];
  onSubmit: (e: React.FormEvent) => void;
  eliminated: boolean;
  eliminatedWeek?: number | null;
};

function formatKickoff(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function MakePickForm({
  week,
  team,
  onTeamChange,
  availableTeams,
  onSubmit,
  eliminated,
  eliminatedWeek,
}: Props) {
  const season = currentNflSeason();
  const { games } = useLiveScores(week, season);
  const kickoff = firstKickoff(games);
  const now = useNow();
  // Kickoff-based locking is a UX convenience, not a security boundary —
  // it relies on the viewer's clock and ESPN's schedule feed, not a
  // server-enforced rule. It's on top of the real guarantee, which is
  // server-side: a pick can only ever be created once (see Pick
  // authorization in amplify/data/resource.ts), never edited afterward.
  const locked = now !== null && kickoff !== null && now >= kickoff.getTime();

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display uppercase tracking-wide text-ink text-lg">
          Make a pick — Week {week}
        </h2>
        {!eliminated && kickoff && (
          <span className="text-xs text-ink-soft">
            {locked ? "Locked" : `Locks ${formatKickoff(kickoff)}`}
          </span>
        )}
      </div>

      {eliminated ? (
        <p className="text-sm text-loss">
          You were eliminated in week {eliminatedWeek}. Thanks for playing — check the standings to
          see who&apos;s still alive.
        </p>
      ) : locked ? (
        <p className="text-sm text-pending">
          Picks for week {week} are locked — the first game already kicked off
          {kickoff ? ` (${formatKickoff(kickoff)})` : ""}.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-sm gap-1 text-ink-soft flex-1 min-w-[200px]">
            Team
            <select
              value={team}
              onChange={(e) => onTeamChange(e.target.value)}
              className="border border-line rounded-md px-2 py-1.5 bg-background text-ink"
            >
              <option value="">Select a team...</option>
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!team}
            className="bg-gold text-ink font-semibold rounded-md px-4 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-soft transition-colors cursor-pointer"
          >
            Submit pick
          </button>
        </form>
      )}
    </section>
  );
}
