"use client";

import { useEffect, useRef } from "react";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

type Result = string | null | undefined;

/** Under-numeral bar for a week you've picked: green won, red lost, grey
 * while the game is still pending. Weeks with no pick get no bar. */
function barClass(result: Result): string {
  if (result === "WIN") return "bg-win";
  if (result === "LOSS") return "bg-loss";
  return "bg-muted";
}

function describe(week: number, picked: boolean, result: Result): string {
  if (!picked) return `Week ${week}`;
  if (result === "WIN") return `Week ${week}, picked, won`;
  if (result === "LOSS") return `Week ${week}, picked, lost`;
  return `Week ${week}, picked, pending`;
}

export function WeekTabs({
  current,
  resultsByWeek,
  onSelect,
}: {
  current: number;
  /** One entry per week the player has picked; the value is that pick's result. */
  resultsByWeek: Map<number, Result>;
  onSelect: (week: number) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);

  // On phones the strip scrolls sideways, so bring the current week into view.
  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    el?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [current]);

  return (
    <div
      ref={strip}
      role="group"
      aria-label="Choose a week"
      className="no-scrollbar -mx-4 flex snap-x gap-0.5 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0"
    >
      {WEEKS.map((w) => {
        const active = w === current;
        const picked = resultsByWeek.has(w);
        const result = resultsByWeek.get(w);
        return (
          <button
            key={w}
            type="button"
            onClick={() => onSelect(w)}
            aria-pressed={active}
            aria-label={describe(w, picked, result)}
            className={`relative h-11 w-10 shrink-0 cursor-pointer snap-center rounded-md font-display text-xl leading-none font-semibold tabular-nums transition-colors lg:w-auto lg:min-w-0 lg:flex-1 lg:shrink ${
              active
                ? "bg-surface text-ink ring-2 ring-inset ring-ink"
                : "text-muted hover:bg-sunk hover:text-ink"
            }`}
          >
            {w}
            {picked && (
              <span
                className={`absolute bottom-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 ${barClass(result)}`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
