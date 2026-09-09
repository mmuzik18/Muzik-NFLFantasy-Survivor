"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/lib/client";
import { usePlayer } from "@/lib/PlayerContext";
import type { Schema } from "../../../../amplify/data/resource";
import { AdminPicksPanel } from "@/components/AdminPicksPanel";
import { AdminPlayersPanel } from "@/components/AdminPlayersPanel";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];

export default function AdminPage() {
  const { admin, loading: playerLoading } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const [playersRes, picksRes] = await Promise.all([
      client.models.Player.list(),
      client.models.Pick.list(),
    ]);
    setPlayers(playersRes.data);
    setPicks(picksRes.data.sort((a, b) => a.week - b.week));
  }

  useEffect(() => {
    if (!admin) return;
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
  }, [admin]);

  async function gradePick(pick: Pick, result: "WIN" | "LOSS") {
    // A loss just records as a loss — it doesn't eliminate the player.
    // Standings tracks win/loss record instead of alive/out.
    await client.models.Pick.update({ id: pick.id, result });
    await refresh();
  }

  async function deletePick(pick: Pick) {
    await client.models.Pick.delete({ id: pick.id });
    await refresh();
  }

  async function updatePlayer(player: Player, isEliminated: boolean, eliminatedWeek: number | null) {
    await client.models.Player.update({ id: player.id, isEliminated, eliminatedWeek });
    await refresh();
  }

  if (playerLoading) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto p-6">
        <p className="text-sm text-ink-soft">Loading...</p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col items-center justify-center gap-3 text-center">
        <h1 className="font-display text-2xl uppercase text-ink">Admins only</h1>
        <p className="text-sm text-ink-soft max-w-sm">
          You don&apos;t have access to this page. If you were just added to the admins group, sign
          all the way out and back in first — group membership only takes effect on a fresh sign-in.
        </p>
        <Link href="/" className="text-sm text-gold hover:underline">
          Back to the pool
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-wide text-ink">Admin</h1>

      {error && (
        <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading...</p>
      ) : (
        <>
          <AdminPicksPanel picks={picks} players={players} onGrade={gradePick} onDelete={deletePick} />
          <AdminPlayersPanel players={players} onUpdate={updatePlayer} />
        </>
      )}
    </div>
  );
}
