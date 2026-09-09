"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { client } from "@/lib/client";
import { attachGames } from "@/lib/gameDisplay";
import { usePlayer } from "@/lib/PlayerContext";
import { useLiveScores, firstKickoff } from "@/lib/useLiveScores";
import { useNow } from "@/lib/useNow";
import { currentNflSeason } from "@/lib/nflWeek";
import { PickBoard } from "@/components/PickBoard";
import { WeekTabs } from "@/components/WeekTabs";
import { ResultBadge } from "@/components/ResultBadge";
import { PicksPanel } from "@/components/PicksPanel";
import { StandingsPanel } from "@/components/StandingsPanel";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];
type Game = Schema["Game"]["type"];

function nextWeekFor(picks: Pick[], playerId: string | undefined): number {
  const weeks = picks.filter((p) => p.playerId === playerId).map((p) => p.week);
  return weeks.length > 0 ? Math.max(...weeks) + 1 : 1;
}

export default function Home() {
  const { myPlayer, loading: playerLoading } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const initializedWeek = useRef(false);

  const myPicks = useMemo(
    () => picks.filter((p) => p.playerId === myPlayer?.id).sort((a, b) => a.week - b.week),
    [picks, myPlayer],
  );
  const decidedPicks = useMemo(
    () => myPicks.filter((p) => p.result === "WIN" || p.result === "LOSS"),
    [myPicks],
  );
  const decidedPicksWithGames = useMemo(() => attachGames(decidedPicks, games), [decidedPicks, games]);
  const usedTeams = useMemo(() => new Set(myPicks.map((p) => p.team)), [myPicks]);
  const pickedWeeks = useMemo(() => new Set(myPicks.map((p) => p.week)), [myPicks]);

  // Season win/loss record per player, for Standings — computed from every
  // player's decided picks, not just this player's.
  const records = useMemo(() => {
    const map = new Map<string, { wins: number; losses: number }>();
    for (const p of picks) {
      if (p.result !== "WIN" && p.result !== "LOSS") continue;
      const r = map.get(p.playerId) ?? { wins: 0, losses: 0 };
      if (p.result === "WIN") r.wins += 1;
      else r.losses += 1;
      map.set(p.playerId, r);
    }
    return map;
  }, [picks]);

  const season = currentNflSeason();
  const pickWeek = nextWeekFor(myPicks, myPlayer?.id);
  const prevWeek = pickWeek - 1;
  const viewWeek = selectedWeek ?? pickWeek;

  const viewWeekLive = useLiveScores(viewWeek, season);
  // Always called (hooks can't be conditional) — needed to know whether
  // pickWeek itself is open yet, independent of which week is being viewed.
  const prevWeekLive = useLiveScores(prevWeek >= 1 ? prevWeek : 1, season);

  const now = useNow();
  const viewWeekKickoff = firstKickoff(viewWeekLive.games);
  const viewWeekStarted = now !== null && viewWeekKickoff !== null && now >= viewWeekKickoff.getTime();

  const prevWeekAllFinal =
    prevWeek < 1 ||
    (!prevWeekLive.loading &&
      (prevWeekLive.games.length === 0 || prevWeekLive.games.every((g) => g.status === "FINAL")));

  const viewPick = myPicks.find((p) => p.week === viewWeek);

  let boardMode: "picking" | "watching" | "locked";
  let statusMessage: string | null = null;
  if (viewPick) {
    boardMode = "watching";
  } else if (viewWeek === pickWeek && prevWeekAllFinal && !viewWeekStarted) {
    boardMode = "picking";
  } else if (viewWeek === pickWeek && !prevWeekAllFinal) {
    boardMode = "locked";
    statusMessage = `Week ${pickWeek} opens once week ${prevWeek}'s games finish.`;
  } else if (viewWeek === pickWeek) {
    boardMode = "locked";
    statusMessage = `The first game of week ${pickWeek} already kicked off and no pick was made in time.`;
  } else if (viewWeek > pickWeek) {
    boardMode = "locked";
    statusMessage = `Week ${viewWeek} isn't open yet — you're currently on week ${pickWeek}.`;
  } else {
    // viewWeek < pickWeek with no pick found shouldn't happen (picks are
    // sequential), but fall back to locked/no-message rather than crash.
    boardMode = "locked";
  }

  async function refresh() {
    const [playersRes, picksRes, gamesRes] = await Promise.all([
      client.models.Player.list(),
      client.models.Pick.list(),
      client.models.Game.list(),
    ]);
    setPlayers(playersRes.data);
    setPicks(picksRes.data.sort((a, b) => a.week - b.week));
    setGames(gamesRes.data);
  }

  useEffect(() => {
    if (!myPlayer) return;
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [myPlayer]);

  useEffect(() => {
    if (!initializedWeek.current && myPlayer && !loading) {
      setSelectedWeek(pickWeek);
      initializedWeek.current = true;
    }
    // Only runs once, right after the first load — pickWeek/myPlayer are
    // read at that moment, not tracked reactively after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPlayer, loading]);

  async function confirmPick(team: string) {
    if (!myPlayer) return;
    setConfirming(true);
    try {
      const res = await client.models.Pick.create({
        playerId: myPlayer.id,
        week: pickWeek,
        team,
        result: "PENDING",
      });
      if (res.errors) {
        setError(JSON.stringify(res.errors));
        console.error("Pick.create errors", res.errors);
      }
      await refresh();
      setSelectedWeek(pickWeek + 1);
    } finally {
      setConfirming(false);
    }
  }

  const isLoading = playerLoading || loading;

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {isLoading && <p className="text-sm text-ink-soft">Loading...</p>}
      {error && (
        <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {!isLoading && (
        <>
          {myPlayer?.isEliminated ? (
            <section className="rounded-xl border border-line bg-card shadow-[var(--shadow-card)] p-5">
              <h2 className="font-display uppercase tracking-wide text-ink text-lg mb-2">
                You&apos;re out
              </h2>
              <p className="text-sm text-loss">
                An admin marked you eliminated in week {myPlayer.eliminatedWeek}. If that&apos;s a
                mistake, ask them to reinstate you.
              </p>
            </section>
          ) : (
            <>
              <WeekTabs current={viewWeek} pickedWeeks={pickedWeeks} onSelect={setSelectedWeek} />

              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="font-display text-2xl uppercase tracking-wide text-ink">
                  Week {viewWeek}
                </h1>
                {viewPick && (
                  <div className="flex items-center gap-2 bg-card border border-gold rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-ink-soft uppercase tracking-wide">Your pick</span>
                    <span className="font-semibold text-ink text-sm">{viewPick.team}</span>
                    <ResultBadge result={viewPick.result} />
                  </div>
                )}
              </div>

              <PickBoard
                key={`${viewWeek}-${boardMode}`}
                week={viewWeek}
                games={viewWeekLive.games}
                mode={boardMode}
                usedTeams={usedTeams}
                highlightTeam={viewPick?.team ?? null}
                onConfirm={confirmPick}
                confirming={confirming}
                loading={viewWeekLive.loading}
                statusMessage={statusMessage}
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PicksPanel picks={decidedPicksWithGames} />
            <StandingsPanel players={players} records={records} />
          </div>
        </>
      )}
    </div>
  );
}
