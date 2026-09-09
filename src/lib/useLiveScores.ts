"use client";

import { useEffect, useState } from "react";
import type { NormalizedGame } from "./espn";

const POLL_MS = 30_000;

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
        setState({ games: body.games as NormalizedGame[], loading: false, error: null });
      } catch (e) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) }));
      } finally {
        if (!cancelled) timer = setTimeout(load, POLL_MS);
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
