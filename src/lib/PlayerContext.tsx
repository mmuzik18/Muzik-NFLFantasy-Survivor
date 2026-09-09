"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../amplify/data/resource";
import { client } from "./client";
import { isAdmin } from "./authGroups";

type Player = Schema["Player"]["type"];

type PlayerContextValue = {
  myPlayer: Player | null;
  admin: boolean;
  loading: boolean;
  error: string | null;
  refreshPlayer: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshPlayer() {
    if (!user) return;
    const existing = await client.models.Player.list();
    const me = existing.data.find((p) => p.id === user.userId) ?? null;
    setMyPlayer(me);
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
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <PlayerContext.Provider value={{ myPlayer, admin, loading, error, refreshPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
