export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-ink-soft py-2">
      <span
        className="h-4 w-4 rounded-full border-2 border-line border-t-gold animate-spin shrink-0"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

/** A skeleton placeholder shaped like the card lists this app renders
 * (StandingsPanel/PicksPanel/PickBoard) — used instead of blank space or
 * "Loading..." text while data is still in flight. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-skeleton flex items-center justify-between py-1">
          <span className="h-3.5 w-28 rounded bg-line" />
          <span className="h-3.5 w-12 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
