"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../amplify/data/resource";
import { client } from "./client";
import { isAdmin } from "./authGroups";
import { consumePendingDisplayName } from "./pendingDisplayName";

type Player = Schema["Player"]["type"];

type PlayerContextValue = {
  myPlayer: Player | null;
  admin: boolean;
  loading: boolean;
  error: string | null;
  /** True until the player has set a display name of their own — the
   * account still shows its default (their email). Drives the "choose
   * your name" prompt on first sign-up (see WelcomeNamePrompt). */
  needsDisplayName: boolean;
  refreshPlayer: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultDisplayName = user?.signInDetails?.loginId || user?.username || "";
  const needsDisplayName = myPlayer !== null && myPlayer.displayName === defaultDisplayName;

  async function refreshPlayer() {
    if (!user) return;
    const existing = await client.models.Player.list();
    const me = existing.data.find((p) => p.id === user.userId) ?? null;
    setMyPlayer(me);
  }

  async function updateDisplayName(name: string) {
    if (!myPlayer) return;
    await client.models.Player.update({ id: myPlayer.id, displayName: name });
    await refreshPlayer();
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
          // A name typed into the sign-up form's display-name field (see
          // providers.tsx) lives in localStorage, not Cognito — Cognito
          // attributes can't be added to an already-deployed pool
          // (confirmed against a real failed deploy). Falls back to the
          // account email if they left it blank; `needsDisplayName` below
          // then drives a one-time prompt in the welcome banner to catch
          // that case too.
          //
          // isEliminated is intentionally omitted — the schema defaults it
          // to false, and the field is admin-write-only from here on.
          const pendingName = consumePendingDisplayName().trim();
          const created = await client.models.Player.create({
            id: user.userId,
            displayName: pendingName || user.signInDetails?.loginId || user.username,
          });
          me = created.data ?? undefined;
        }
        setMyPlayer(me ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <PlayerContext.Provider
      value={{ myPlayer, admin, loading, error, needsDisplayName, refreshPlayer, updateDisplayName }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
