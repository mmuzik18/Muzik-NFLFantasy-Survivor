// Best-effort, in-memory fixed-window rate limiter. It's per-server-
// instance, not shared across a fleet — Amplify Hosting can run more than
// one compute instance, so a determined attacker distributed across
// instances (or one that gets load-balanced around) could exceed this in
// aggregate. That's an acceptable tradeoff here: this endpoint only
// proxies ESPN's public scoreboard (no cost, no secrets, no write access),
// so the goal is blocking casual abuse/runaway polling loops, not
// defending a high-value target. A real distributed limiter would need a
// shared store (DynamoDB/Redis) — not worth the added infrastructure for
// this endpoint's actual risk level.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const hits = new Map<string, { count: number; resetAt: number }>();

// Bound memory: sweep expired entries periodically instead of on every
// request.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort caller identity from standard proxy headers (Amplify
 * Hosting/CloudFront sets x-forwarded-for); falls back to a shared bucket
 * if neither is present rather than skipping the limit entirely. */
export function clientKeyFrom(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
