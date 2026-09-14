"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/lib/client";
import { usePlayer } from "@/lib/PlayerContext";
import type { Schema } from "../../../../amplify/data/resource";
import { AdminPicksPanel } from "@/components/AdminPicksPanel";
import { AdminPlayersPanel } from "@/components/AdminPlayersPanel";
import { Spinner, SkeletonRows } from "@/components/Spinner";
import { useToast } from "@/components/ToastProvider";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type Player = Schema["Player"]["type"];
type Pick = Schema["Pick"]["type"];

type PendingConfirm =
  | { kind: "delete-pick"; pick: Pick }
  | { kind: "eliminate-player"; player: Player; week: number };

export default function AdminPage() {
  const { admin, loading: playerLoading } = usePlayer();
  const toast = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

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
    toast.success(`Graded week ${pick.week} as a ${result === "WIN" ? "win" : "loss"}.`);
    await refresh();
  }

  async function deletePickConfirmed(pick: Pick) {
    await client.models.Pick.delete({ id: pick.id });
    toast.success(`Deleted week ${pick.week}'s pick.`);
    await refresh();
  }

  async function updatePlayer(player: Player, isEliminated: boolean, eliminatedWeek: number | null) {
    await client.models.Player.update({ id: player.id, isEliminated, eliminatedWeek });
    toast.success(isEliminated ? `${player.displayName} marked eliminated.` : `${player.displayName} reinstated.`);
    await refresh();
  }

  function requestDeletePick(pick: Pick) {
    setPendingConfirm({ kind: "delete-pick", pick });
  }

  function requestUpdatePlayer(player: Player, isEliminated: boolean, eliminatedWeek: number | null) {
    if (isEliminated) {
      setPendingConfirm({ kind: "eliminate-player", player, week: eliminatedWeek ?? 1 });
    } else {
      // Reinstating isn't destructive — no confirmation needed.
      updatePlayer(player, false, null);
    }
  }

  async function handleConfirm() {
    if (!pendingConfirm) return;
    if (pendingConfirm.kind === "delete-pick") {
      await deletePickConfirmed(pendingConfirm.pick);
    } else {
      await updatePlayer(pendingConfirm.player, true, pendingConfirm.week);
    }
    setPendingConfirm(null);
  }

  if (playerLoading) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto p-6">
        <Spinner />
        <SkeletonRows />
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
    <div id="main-content" className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-wide text-ink">Admin</h1>

      {error && (
        <p className="text-sm text-loss bg-loss-bg border border-loss/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <>
          <Spinner />
          <SkeletonRows />
        </>
      ) : (
        <>
          <AdminPicksPanel picks={picks} players={players} onGrade={gradePick} onDelete={requestDeletePick} />
          <AdminPlayersPanel players={players} onUpdate={requestUpdatePlayer} />
        </>
      )}

      <ConfirmDialog
        open={pendingConfirm !== null}
        title={pendingConfirm?.kind === "delete-pick" ? "Delete this pick?" : "Mark player eliminated?"}
        body={
          pendingConfirm?.kind === "delete-pick"
            ? `This deletes week ${pendingConfirm.pick.week}'s pick for ${
                players.find((p) => p.id === pendingConfirm.pick.playerId)?.displayName ?? "this player"
              }, freeing up that team and that week for them again.`
            : pendingConfirm?.kind === "eliminate-player"
              ? `${pendingConfirm.player.displayName} will be shown as out starting week ${pendingConfirm.week}. You can reinstate them later.`
              : ""
        }
        confirmLabel={pendingConfirm?.kind === "delete-pick" ? "Delete" : "Eliminate"}
        danger
        onConfirm={handleConfirm}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
