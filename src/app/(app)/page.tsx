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
import { PickSummary, formatLockTime } from "@/components/PickSummary";
import { PicksPanel } from "@/components/PicksPanel";
import { StandingsPanel } from "@/components/StandingsPanel";
import { PoolSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/ToastProvider";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];
type Game = Schema["Game"]["type"];

function nextWeekFor(picks: Pick[], playerId: string | undefined): number {
  const weeks = picks.filter((p) => p.playerId === playerId).map((p) => p.week);
  return weeks.length > 0 ? Math.max(...weeks) + 1 : 1;
}

export default function Home() {
  const { myPlayer, loading: playerLoading } = usePlayer();
  const toast = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  // Starts false, not true: if myPlayer never loads (e.g. Player.create
  // fails for this account), the effect below never runs and this would
  // otherwise be stuck at its initial value forever — see isLoading.
  const [loading, setLoading] = useState(false);
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
  const resultsByWeek = useMemo(
    () => new Map(myPicks.map((p) => [p.week, p.result] as const)),
    [myPicks],
  );

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
  if (viewWeek === pickWeek && prevWeekAllFinal && !viewWeekStarted) {
    // The window's genuinely open — stay editable even if a pick already
    // exists for it, so the player can change their mind up to kickoff.
    boardMode = "picking";
  } else if (viewPick) {
    boardMode = "watching";
  } else if (viewWeek === pickWeek && !prevWeekAllFinal) {
    boardMode = "locked";
    statusMessage = `Week ${pickWeek} opens once week ${prevWeek}'s games finish.`;
  } else if (viewWeek === pickWeek) {
    boardMode = "locked";
    statusMessage = `The first game of week ${pickWeek} already kicked off and no pick was made in time.`;
  } else if (viewWeek > pickWeek) {
    boardMode = "locked";
    statusMessage = `Week ${viewWeek} isn't open yet. You're currently on week ${pickWeek}.`;
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
      // A pick for pickWeek may already exist (the player changing their
      // mind before the week locks) — update it in place rather than
      // creating a second record for the same week. `result` is
      // intentionally omitted from both calls: the owner doesn't have
      // create/update permission on that field (server-enforced — see
      // amplify/data/resource.ts), it's admin/system-graded only, and the
      // schema defaults a new pick's result to PENDING automatically.
      const existing = myPicks.find((p) => p.week === pickWeek);
      const res = existing
        ? await client.models.Pick.update({ id: existing.id, team })
        : await client.models.Pick.create({ playerId: myPlayer.id, week: pickWeek, team });
      if (res.errors) {
        setError(JSON.stringify(res.errors));
        console.error("Pick save errors", res.errors);
        toast.error("Couldn't save your pick. Try again.");
      } else {
        toast.success(`Pick saved: ${team} for week ${pickWeek}.`);
      }
      await refresh();
    } finally {
      setConfirming(false);
    }
  }

  const isLoading = playerLoading || loading;
  const eliminated = Boolean(myPlayer?.isEliminated);

  return (
    <>
      {!isLoading && !eliminated && (
        <div className="no-print sticky top-14 z-10 border-b border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <WeekTabs current={viewWeek} resultsByWeek={resultsByWeek} onSelect={setSelectedWeek} />
          </div>
        </div>
      )}

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-6">
        {isLoading && <PoolSkeleton />}

        {error && (
          <p role="alert" className="mt-6 rounded-md border border-loss/30 bg-loss-soft px-3 py-2 text-sm text-loss">
            {error}
          </p>
        )}

        {!isLoading && (
          <>
            {eliminated ? (
              <section className="mt-8 rounded-md bg-ink px-6 py-5 text-paper">
                <h1 className="text-lg font-semibold tracking-tight">You&apos;re out</h1>
                <p className="mt-1 text-sm opacity-75">
                  An admin marked you eliminated in week {myPlayer?.eliminatedWeek}. If that&apos;s a
                  mistake, ask them to reinstate you.
                </p>
              </section>
            ) : (
              <header className="grid gap-6 pt-8 pb-10 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <h1 className="font-display text-[clamp(3.5rem,9vw,6.5rem)] leading-[0.85] font-bold tracking-tight text-ink">
                    <span className="font-medium text-muted">Week</span> {viewWeek}
                  </h1>
                  {viewWeekKickoff && (
                    <p className="mt-4 text-sm text-muted">
                      {boardMode === "picking"
                        ? "Picks lock "
                        : viewWeekStarted
                          ? "Locked since "
                          : "First kickoff "}
                      {formatLockTime(viewWeekKickoff)}
                    </p>
                  )}
                </div>
                <PickSummary pick={viewPick} picking={boardMode === "picking"} week={viewWeek} />
              </header>
            )}

            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
              {!eliminated && (
                <PickBoard
                  key={`${viewWeek}-${boardMode}`}
                  week={viewWeek}
                  games={viewWeekLive.games}
                  mode={boardMode}
                  usedTeams={usedTeams}
                  highlightTeam={viewPick?.team ?? null}
                  confirmedTeam={viewPick?.team ?? null}
                  pickResult={viewPick?.result ?? null}
                  onConfirm={confirmPick}
                  confirming={confirming}
                  loading={viewWeekLive.loading}
                  statusMessage={statusMessage}
                />
              )}

              <aside
                className={
                  eliminated
                    ? "grid gap-12 pt-10 md:grid-cols-2 lg:col-span-full"
                    : "flex flex-col gap-12"
                }
              >
                <StandingsPanel players={players} records={records} meId={myPlayer?.id} />
                <PicksPanel picks={decidedPicksWithGames} />
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}
