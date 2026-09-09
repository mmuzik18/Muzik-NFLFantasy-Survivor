"use client";

import { useEffect, useMemo, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { client } from "@/lib/client";
import { NFL_TEAMS } from "@/lib/teams";
import { attachGames } from "@/lib/gameDisplay";
import { usePlayer } from "@/lib/PlayerContext";
import { MakePickForm } from "@/components/MakePickForm";
import { PicksPanel } from "@/components/PicksPanel";
import { StandingsPanel } from "@/components/StandingsPanel";
import { AdminGradePanel } from "@/components/AdminGradePanel";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];
type Game = Schema["Game"]["type"];

function nextWeekFor(picks: Pick[], playerId: string | undefined): number {
  const weeks = picks.filter((p) => p.playerId === playerId).map((p) => p.week);
  return weeks.length > 0 ? Math.max(...weeks) + 1 : 1;
}

export default function Home() {
  const { myPlayer, admin, loading: playerLoading } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myPicks = useMemo(
    () => picks.filter((p) => p.playerId === myPlayer?.id).sort((a, b) => a.week - b.week),
    [picks, myPlayer],
  );
  const myPicksWithGames = useMemo(() => attachGames(myPicks, games), [myPicks, games]);
  const usedTeams = useMemo(() => new Set(myPicks.map((p) => p.team)), [myPicks]);
  const availableTeams = NFL_TEAMS.filter((t) => !usedTeams.has(t));
  const week = useMemo(() => nextWeekFor(myPicks, myPlayer?.id), [myPicks, myPlayer]);

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
          <MakePickForm
            week={week}
            team={team}
            onTeamChange={setTeam}
            availableTeams={availableTeams}
            onSubmit={submitPick}
            eliminated={!!myPlayer?.isEliminated}
            eliminatedWeek={myPlayer?.eliminatedWeek}
          />

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
  );
}
