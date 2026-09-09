type Props = {
  week: number;
  onWeekChange: (week: number) => void;
  team: string;
  onTeamChange: (team: string) => void;
  availableTeams: readonly string[];
  onSubmit: (e: React.FormEvent) => void;
  eliminated: boolean;
  eliminatedWeek?: number | null;
};

export function MakePickForm({
  week,
  onWeekChange,
  team,
  onTeamChange,
  availableTeams,
  onSubmit,
  eliminated,
  eliminatedWeek,
}: Props) {
  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-4">Make a pick</h2>

      {eliminated ? (
        <p className="text-sm text-loss">
          You were eliminated in week {eliminatedWeek}. Thanks for playing — check the standings to
          see who&apos;s still alive.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-sm gap-1 text-ink-soft">
            Week
            <input
              type="number"
              min={1}
              max={18}
              value={week}
              onChange={(e) => onWeekChange(Number(e.target.value))}
              className="border border-line rounded-md px-2 py-1.5 w-20 bg-background text-ink"
            />
          </label>
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
