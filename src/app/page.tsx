"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useEffect, useMemo, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { client } from "@/lib/client";
import { NFL_TEAMS } from "@/lib/teams";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];

export default function Home() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [week, setWeek] = useState(1);
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const myPicks = useMemo(
    () => picks.filter((p) => p.owner?.startsWith(user?.userId ?? "\0")),
    [picks, user],
  );
  const usedTeams = useMemo(() => new Set(myPicks.map((p) => p.team)), [myPicks]);
  const availableTeams = NFL_TEAMS.filter((t) => !usedTeams.has(t));

  async function refresh() {
    const [playersRes, picksRes] = await Promise.all([
      client.models.Player.list(),
      client.models.Pick.list(),
    ]);
    setPlayers(playersRes.data);
    setPicks(picksRes.data.sort((a, b) => a.week - b.week));
  }

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const existing = await client.models.Player.list();
        let me = existing.data.find((p) => p.owner?.startsWith(user.userId));
        if (!me) {
          const created = await client.models.Player.create({
            displayName: user.signInDetails?.loginId ?? user.username,
            isEliminated: false,
          });
          me = created.data ?? undefined;
        }
        setMyPlayer(me ?? null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const nextWeek =
      myPicks.length > 0 ? Math.max(...myPicks.map((p) => p.week)) + 1 : 1;
    setWeek(nextWeek);
  }, [myPicks]);

  async function submitPick(e: React.FormEvent) {
    e.preventDefault();
    if (!team) return;
    await client.models.Pick.create({ week, team, result: "PENDING" });
    setTeam("");
    await refresh();
  }

  async function gradePick(pick: Pick, result: "WIN" | "LOSS") {
    await client.models.Pick.update({ id: pick.id, result });
    if (result === "LOSS") {
      const owner = players.find((p) => p.owner === pick.owner);
      if (owner && !owner.isEliminated) {
        await client.models.Player.update({
          id: owner.id,
          isEliminated: true,
          eliminatedWeek: pick.week,
        });
      }
    }
    await refresh();
  }

  if (!user) return null;

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">NFL Survivor Pool</h1>
        <button onClick={signOut} className="text-sm text-gray-500 hover:underline">
          Sign out ({myPlayer?.displayName ?? user.username})
        </button>
      </header>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && (
        <>
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Make a pick</h2>
            {myPlayer?.isEliminated ? (
              <p className="text-red-600">
                You were eliminated in week {myPlayer.eliminatedWeek}.
              </p>
            ) : (
              <form onSubmit={submitPick} className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col text-sm gap-1">
                  Week
                  <input
                    type="number"
                    min={1}
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20"
                  />
                </label>
                <label className="flex flex-col text-sm gap-1">
                  Team
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Select a team...</option>
                    {availableTeams.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={!team}
                  className="bg-black text-white rounded px-4 py-1.5 disabled:opacity-40"
                >
                  Submit pick
                </button>
              </form>
            )}
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">My picks</h2>
            {myPicks.length === 0 ? (
              <p className="text-sm text-gray-500">No picks yet.</p>
            ) : (
              <ul className="text-sm divide-y">
                {myPicks.map((p) => (
                  <li key={p.id} className="py-1.5 flex justify-between">
                    <span>
                      Week {p.week} — {p.team}
                    </span>
                    <span
                      className={
                        p.result === "WIN"
                          ? "text-green-600"
                          : p.result === "LOSS"
                            ? "text-red-600"
                            : "text-gray-500"
                      }
                    >
                      {p.result}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Standings</h2>
            <ul className="text-sm divide-y">
              {players.map((p) => (
                <li key={p.id} className="py-1.5 flex justify-between">
                  <span>{p.displayName}</span>
                  <span className={p.isEliminated ? "text-red-600" : "text-green-600"}>
                    {p.isEliminated ? `Eliminated (week ${p.eliminatedWeek})` : "Alive"}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Commissioner: grade picks</h2>
            <p className="text-xs text-gray-500 mb-3">
              Any signed-in player can grade picks in this MVP — lock this down with a
              Cognito admin group before real use.
            </p>
            <ul className="text-sm divide-y">
              {picks
                .filter((p) => p.result === "PENDING")
                .map((p) => (
                  <li key={p.id} className="py-1.5 flex items-center justify-between">
                    <span>
                      Week {p.week} — {p.team}
                    </span>
                    <span className="flex gap-2">
                      <button
                        onClick={() => gradePick(p, "WIN")}
                        className="text-green-700 border border-green-700 rounded px-2 py-0.5 text-xs"
                      >
                        Win
                      </button>
                      <button
                        onClick={() => gradePick(p, "LOSS")}
                        className="text-red-700 border border-red-700 rounded px-2 py-0.5 text-xs"
                      >
                        Loss
                      </button>
                    </span>
                  </li>
                ))}
              {picks.filter((p) => p.result === "PENDING").length === 0 && (
                <p className="text-sm text-gray-500 py-1.5">Nothing to grade.</p>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
