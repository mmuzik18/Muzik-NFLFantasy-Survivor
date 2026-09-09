import type { Schema } from "../../amplify/data/resource";

type Game = Schema["Game"]["type"];

function formatKickoff(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function GameCard({ game }: { game: Game }) {
  const isFinal = game.status === "FINAL";
  const isLive = game.status === "IN_PROGRESS";

  return (
    <div className="rounded-lg border border-line bg-card px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide ${
            isLive ? "text-loss" : isFinal ? "text-ink-soft" : "text-ink-soft"
          }`}
        >
          {isLive ? (game.statusDetail || "Live") : isFinal ? "Final" : formatKickoff(game.startTime)}
        </span>
      </div>
      <TeamRow team={game.awayTeam} score={game.awayScore} won={game.winner === game.awayTeam} />
      <TeamRow team={game.homeTeam} score={game.homeScore} won={game.winner === game.homeTeam} />
    </div>
  );
}

function TeamRow({
  team,
  score,
  won,
}: {
  team: string;
  score: number | null | undefined;
  won: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`text-sm ${won ? "font-semibold text-ink" : "text-ink-soft"}`}>{team}</span>
      <span className={`font-score text-lg tabular-nums ${won ? "text-ink" : "text-ink-soft"}`}>
        {score ?? "-"}
      </span>
    </div>
  );
}

export function Scoreboard({
  games,
  week,
  onWeekChange,
}: {
  games: Game[];
  week: number;
  onWeekChange: (week: number) => void;
}) {
  const weekGames = games
    .filter((g) => g.week === week)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display uppercase tracking-wide text-ink text-lg">Scoreboard</h2>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Week
          <input
            type="number"
            min={1}
            max={18}
            value={week}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="w-16 rounded-md border border-line bg-background px-2 py-1 text-ink"
          />
        </label>
      </div>

      {weekGames.length === 0 ? (
        <p className="text-sm text-ink-soft">
          No synced games for week {week} yet. Run{" "}
          <code className="text-xs bg-background px-1 py-0.5 rounded">npm run sync-scores</code> to
          pull scores from ESPN.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {weekGames.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </section>
  );
}
