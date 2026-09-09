"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useMemo, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { client } from "@/lib/client";
import { NFL_TEAMS } from "@/lib/teams";
import { attachGames } from "@/lib/gameDisplay";
import { isAdmin } from "@/lib/authGroups";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MakePickForm } from "@/components/MakePickForm";
import { PicksPanel } from "@/components/PicksPanel";
import { StandingsPanel } from "@/components/StandingsPanel";
import { Scoreboard } from "@/components/Scoreboard";
import { AdminGradePanel } from "@/components/AdminGradePanel";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];
type Game = Schema["Game"]["type"];

function nextWeekFor(picks: Pick[], playerId: string | undefined): number {
  const weeks = picks.filter((p) => p.playerId === playerId).map((p) => p.week);
  return weeks.length > 0 ? Math.max(...weeks) + 1 : 1;
}

export default function Home() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [week, setWeek] = useState(1);
  const [scoreboardWeek, setScoreboardWeek] = useState(1);
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);

  const myPicks = useMemo(
    () => picks.filter((p) => p.playerId === myPlayer?.id).sort((a, b) => a.week - b.week),
    [picks, myPlayer],
  );
  const myPicksWithGames = useMemo(() => attachGames(myPicks, games), [myPicks, games]);
  const usedTeams = useMemo(() => new Set(myPicks.map((p) => p.team)), [myPicks]);
  const availableTeams = NFL_TEAMS.filter((t) => !usedTeams.has(t));

  async function refresh() {
    const [playersRes, picksRes, gamesRes] = await Promise.all([
      client.models.Player.list(),
      client.models.Pick.list(),
      client.models.Game.list(),
    ]);
    const nextPicks = picksRes.data.sort((a, b) => a.week - b.week);
    setPlayers(playersRes.data);
    setPicks(nextPicks);
    setGames(gamesRes.data);
    return nextPicks;
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        setAdmin(await isAdmin());
        const existing = await client.models.Player.list();
        let me = existing.data.find((p) => p.id === user.userId);
        if (!me) {
          // isEliminated is intentionally omitted — the schema defaults it
          // to false, and the field is admin-write-only from here on.
          const created = await client.models.Player.create({
            id: user.userId,
            displayName: user.signInDetails?.loginId ?? user.username,
          });
          me = created.data ?? undefined;
        }
        setMyPlayer(me ?? null);
        const freshPicks = await refresh();
        const nextWeek = nextWeekFor(freshPicks, me?.id);
        setWeek(nextWeek);
        setScoreboardWeek(nextWeek);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function submitPick(e: React.FormEvent) {
    e.preventDefault();
    if (!team || !myPlayer) return;
    const res = await client.models.Pick.create({
      playerId: myPlayer.id,
      week,
      team,
      result: "PENDING",
    });
    if (res.errors) {
      setError(JSON.stringify(res.errors));
      console.error("Pick.create errors", res.errors);
    }
    setTeam("");
    await refresh();
    setWeek((w) => w + 1);
    setScoreboardWeek((w) => w + 1);
  }

  async function gradePick(pick: Pick, result: "WIN" | "LOSS") {
    await client.models.Pick.update({ id: pick.id, result });
    if (result === "LOSS") {
      const picker = players.find((p) => p.id === pick.playerId);
      if (picker && !picker.isEliminated) {
        await client.models.Player.update({
          id: picker.id,
          isEliminated: true,
          eliminatedWeek: pick.week,
        });
      }
    }
    await refresh();
  }

  if (!user) return null;

  return (
    <>
      <Navbar displayName={myPlayer?.displayName ?? user.username} />
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {loading && <p className="text-sm text-ink-soft">Loading...</p>}
        {error && (
          <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {!loading && (
          <>
            <MakePickForm
              week={week}
              onWeekChange={setWeek}
              team={team}
              onTeamChange={setTeam}
              availableTeams={availableTeams}
              onSubmit={submitPick}
              eliminated={!!myPlayer?.isEliminated}
              eliminatedWeek={myPlayer?.eliminatedWeek}
            />

            <Scoreboard games={games} week={scoreboardWeek} onWeekChange={setScoreboardWeek} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PicksPanel picks={myPicksWithGames} />
              <StandingsPanel players={players} />
            </div>

            {admin && (
              <AdminGradePanel
                pendingPicks={picks.filter((p) => p.result === "PENDING")}
                onGrade={gradePick}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
