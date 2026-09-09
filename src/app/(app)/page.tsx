"use client";

import { useEffect, useMemo, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { client } from "@/lib/client";
import { attachGames } from "@/lib/gameDisplay";
import { usePlayer } from "@/lib/PlayerContext";
import { useLiveScores, firstKickoff } from "@/lib/useLiveScores";
import { useNow } from "@/lib/useNow";
import { currentNflSeason } from "@/lib/nflWeek";
import { PickBoard } from "@/components/PickBoard";
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

  const myPicks = useMemo(
    () => picks.filter((p) => p.playerId === myPlayer?.id).sort((a, b) => a.week - b.week),
    [picks, myPlayer],
  );
  const myPicksWithGames = useMemo(() => attachGames(myPicks, games), [myPicks, games]);
  const usedTeams = useMemo(() => new Set(myPicks.map((p) => p.team)), [myPicks]);

  const season = currentNflSeason();
  // `pickWeek` is the next week this player is due to pick (1 if they
  // haven't picked at all yet). `prevWeek` is the week immediately before
  // it — the one that has to fully finish before pickWeek's board opens.
  const pickWeek = nextWeekFor(myPicks, myPlayer?.id);
  const prevWeek = pickWeek - 1;
  const lastPick = myPicks.find((p) => p.week === prevWeek);

  const pickWeekLive = useLiveScores(pickWeek, season);
  // Always called (hooks can't be conditional) — for week 1 this just
  // redundantly fetches week 1 again and the result goes unused below.
  const prevWeekLive = useLiveScores(prevWeek >= 1 ? prevWeek : 1, season);

  const now = useNow();
  const pickWeekKickoff = firstKickoff(pickWeekLive.games);
  const pickWeekStarted = now !== null && pickWeekKickoff !== null && now >= pickWeekKickoff.getTime();

  // If ESPN genuinely has no games for prevWeek (not just "still loading"),
  // don't get stuck waiting forever — treat it as finished.
  const prevWeekAllFinal =
    prevWeek < 1 ||
    (!prevWeekLive.loading &&
      (prevWeekLive.games.length === 0 || prevWeekLive.games.every((g) => g.status === "FINAL")));

  const boardMode = !prevWeekAllFinal ? "watching" : pickWeekStarted ? "locked" : "picking";
  const boardWeek = boardMode === "watching" ? prevWeek : pickWeek;
  const boardGames = boardMode === "watching" ? prevWeekLive.games : pickWeekLive.games;
  const boardLoading = boardMode === "watching" ? prevWeekLive.loading : pickWeekLive.loading;
  const topPick = boardMode === "watching" ? lastPick : undefined;

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
                You were eliminated in week {myPlayer.eliminatedWeek}. Thanks for playing — check the
                standings to see who&apos;s still alive.
              </p>
            </section>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="font-display text-2xl uppercase tracking-wide text-ink">
                  Week {boardWeek}
                </h1>
                {topPick && (
                  <div className="flex items-center gap-2 bg-card border border-gold rounded-lg px-3 py-1.5">
                    <span className="text-[10px] text-ink-soft uppercase tracking-wide">Your pick</span>
                    <span className="font-semibold text-ink text-sm">{topPick.team}</span>
                  </div>
                )}
                {!prevWeekAllFinal && (
                  <span className="text-xs text-ink-soft">
                    Week {pickWeek} opens once week {prevWeek}&apos;s games finish.
                  </span>
                )}
              </div>

              <PickBoard
                key={`${boardWeek}-${boardMode}`}
                week={boardWeek}
                games={boardGames}
                mode={boardMode}
                usedTeams={usedTeams}
                highlightTeam={topPick?.team ?? null}
                onConfirm={confirmPick}
                confirming={confirming}
                loading={boardLoading}
              />
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PicksPanel picks={myPicksWithGames} />
            <StandingsPanel players={players} />
          </div>
        </>
      )}
    </div>
  );
}
