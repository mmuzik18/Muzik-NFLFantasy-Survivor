"use client";

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

export function WeekTabs({
  current,
  pickedWeeks,
  onSelect,
}: {
  current: number;
  pickedWeeks: Set<number>;
  onSelect: (week: number) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
      {WEEKS.map((w) => {
        const active = w === current;
        return (
          <button
            key={w}
            type="button"
            onClick={() => onSelect(w)}
            className={`relative shrink-0 w-9 h-9 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-gold text-ink"
                : "bg-card border border-line text-ink-soft hover:text-ink hover:border-gold/50"
            }`}
          >
            {w}
            {pickedWeeks.has(w) && !active && (
              <span
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-ink-soft"
                aria-hidden="true"
                title="You picked this week"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
