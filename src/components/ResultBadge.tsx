// Pick.result is a plain string in the schema, not an enum (see
// amplify/data/resource.ts for why), so this widens to any string rather
// than the old literal union.
type Result = string | null | undefined;

const STYLES: Record<string, string> = {
  WIN: "bg-win-soft text-win",
  LOSS: "bg-loss-soft text-loss",
  PENDING: "bg-sunk text-muted",
};

const LABELS: Record<string, string> = {
  WIN: "Won",
  LOSS: "Lost",
  PENDING: "Pending",
};

export function ResultBadge({ result }: { result: Result }) {
  const key = result ?? "PENDING";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${STYLES[key] ?? STYLES.PENDING}`}
    >
      {LABELS[key] ?? LABELS.PENDING}
    </span>
  );
}
