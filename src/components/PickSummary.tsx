import type { Schema } from "../../amplify/data/resource";
import { ResultBadge } from "./ResultBadge";

type Pick = Schema["Pick"]["type"];

export function formatLockTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** The pool header's right-hand block: this week's pick at a glance, or a
 * nudge to make one while the week is still open. */
export function PickSummary({
  pick,
  picking,
  week,
}: {
  pick: Pick | undefined;
  picking: boolean;
  week: number;
}) {
  if (pick) {
    return (
      <div className="flex min-w-0 items-center justify-between gap-6 rounded-md bg-ink px-5 py-4 text-paper md:min-w-[19rem]">
        <div className="min-w-0">
          <p className="text-xs opacity-70">Your pick</p>
          <p className="mt-1 truncate font-display text-3xl leading-none font-bold">{pick.team}</p>
        </div>
        <ResultBadge result={pick.result} />
      </div>
    );
  }
  if (picking) {
    return (
      <div className="rounded-md border border-dashed border-line px-5 py-4 md:min-w-[19rem]">
        <p className="text-sm font-medium text-ink">No pick yet for week {week}</p>
        <p className="mt-1 text-sm text-muted">Choose a team below.</p>
      </div>
    );
  }
  return null;
}
