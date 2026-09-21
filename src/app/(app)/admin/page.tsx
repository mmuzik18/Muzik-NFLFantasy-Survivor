"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { client } from "@/lib/client";
import { usePlayer } from "@/lib/PlayerContext";
import type { Schema } from "../../../../amplify/data/resource";
import { AdminPicksPanel } from "@/components/AdminPicksPanel";
import { AdminPlayersPanel } from "@/components/AdminPlayersPanel";
import { SkeletonRows } from "@/components/Skeleton";
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
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <SkeletonRows />
        </div>
      </main>
    );
  }

  if (!admin) {
    return (
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-16 pb-24 sm:px-6">
        <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-tight text-ink">
          Admins only
        </h1>
        <p className="mt-5 max-w-[52ch] leading-relaxed text-muted">
          You don&apos;t have access to this page. If you were just added to the admins group, sign
          all the way out and back in first. Group membership only takes effect on a fresh sign-in.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4 hover:text-muted"
        >
          Back to the pool
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="pt-12 pb-10 font-display text-[clamp(3rem,8vw,5rem)] leading-[0.9] font-bold tracking-tight text-ink">
          Admin
        </h1>

        {error && (
          <p role="alert" className="mb-8 rounded-md border border-loss/30 bg-loss-soft px-3 py-2 text-sm text-loss">
            {error}
          </p>
        )}

        {loading ? (
          <SkeletonRows rows={5} />
        ) : (
          <div className="flex flex-col gap-14">
            <AdminPicksPanel picks={picks} players={players} onGrade={gradePick} onDelete={requestDeletePick} />
            <AdminPlayersPanel players={players} onUpdate={requestUpdatePlayer} />
          </div>
        )}
      </div>

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
    </main>
  );
}
