// Pick.result is a plain string in the schema, not an enum (see
// amplify/data/resource.ts for why), so this widens to any string rather
// than the old literal union.
type Result = string | null | undefined;

const STYLES: Record<string, string> = {
  WIN: "bg-win-bg text-win",
  LOSS: "bg-loss-bg text-loss",
  PENDING: "bg-pending-bg text-pending",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  );
}
