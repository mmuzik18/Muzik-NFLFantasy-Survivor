/** Generic list-row placeholder, used by the admin tables while data is in flight. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-skeleton flex items-center justify-between py-1">
          <span className="h-4 w-32 rounded-md bg-sunk" />
          <span className="h-4 w-14 rounded-md bg-sunk" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder shaped like the pool page itself (week numeral, week strip,
 * matchup tiles, standings rail) so nothing jumps when real data lands. */
export function PoolSkeleton() {
  return (
    <div role="status" aria-label="Loading the pool" className="animate-skeleton">
      <div className="flex gap-1 border-b border-line py-2">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="h-10 w-10 shrink-0 rounded-md bg-sunk lg:w-auto lg:flex-1" />
        ))}
      </div>
      <div className="pt-8 pb-8">
        <span className="block h-20 w-56 rounded-md bg-sunk sm:h-28 sm:w-80" />
        <span className="mt-4 block h-4 w-48 rounded-md bg-sunk" />
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-28 rounded-md bg-sunk" />
          ))}
        </div>
        <div className="space-y-3">
          <span className="block h-4 w-24 rounded-md bg-sunk" />
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="block h-8 rounded-md bg-sunk" />
          ))}
        </div>
      </div>
    </div>
  );
}
