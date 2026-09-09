"use client";

import { useEffect, useState } from "react";
import type { NormalizedGame } from "./espn";

// Poll briskly while a game the caller is watching is actually live, and
// back off when nothing's in progress — no reason to hammer ESPN's public
// endpoint every 15s during a Tuesday with no games on.
const POLL_MS_LIVE = 15_000;
const POLL_MS_IDLE = 45_000;

type State = {
  games: NormalizedGame[];
  loading: boolean;
  error: string | null;
};

/** Live NFL schedule/scores for one week, polled from our /api/scores proxy. */
export function useLiveScores(week: number, season: number) {
  const [state, setState] = useState<State>({ games: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const res = await fetch(`/api/scores?week=${week}&season=${season}`);
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(body.error ?? `Request failed: ${res.status}`);
        const games = body.games as NormalizedGame[];
        setState({ games, loading: false, error: null });
        const anyLive = games.some((g) => g.status === "IN_PROGRESS");
        timer = setTimeout(load, anyLive ? POLL_MS_LIVE : POLL_MS_IDLE);
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
        if (!cancelled) timer = setTimeout(load, POLL_MS_IDLE);
      }
    }

    setState((s) => ({ ...s, loading: true }));
    load();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [week, season]);

  return state;
}

/** Earliest kickoff among a week's games, or null if the schedule isn't known yet. */
export function firstKickoff(games: NormalizedGame[]): Date | null {
  if (games.length === 0) return null;
  return new Date(Math.min(...games.map((g) => new Date(g.startTime).getTime())));
}
