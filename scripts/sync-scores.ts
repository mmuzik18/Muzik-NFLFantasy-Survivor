/**
 * Pulls NFL scores from ESPN and syncs them into the app's Game model, then
 * auto-grades any pending Picks whose game just went final (marking the
 * picker eliminated on a loss, same rule the in-app commissioner tools use).
 *
 * Requires an admin account (a Cognito user in the `admins` group — see
 * README) since Game writes and Pick/Player grading are locked to that
 * group. Run after adding yourself to the group:
 *
 *   npm run sync-scores -- --week 1 --season 2026
 *
 * With no --week, it syncs the current NFL week automatically. Safe to
 * re-run any time (e.g. from cron every 15 minutes on game day) — games
 * are upserted by their ESPN event id, and only PENDING picks are graded.
 */
import { Amplify } from "aws-amplify";
import { signIn, getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";
import { fetchWeekScores, type NormalizedGame } from "../src/lib/espn";
import { currentNflSeason, currentNflWeekGuess } from "../src/lib/nflWeek";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };
  const now = new Date();
  return {
    week: get("--week") ? Number(get("--week")) : currentNflWeekGuess(now),
    season: get("--season") ? Number(get("--season")) : currentNflSeason(now),
  };
}

async function main() {
  const { week, season } = parseArgs();
  const email = process.env.SYNC_ADMIN_EMAIL;
  const password = process.env.SYNC_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set SYNC_ADMIN_EMAIL and SYNC_ADMIN_PASSWORD (an account in the `admins` " +
        "Cognito group) in your environment or .env.local — see README.",
    );
  }

  Amplify.configure(outputs);
  await signIn({ username: email, password });
  const user = await getCurrentUser();
  console.log(`Signed in as ${user.username}. Syncing week ${week}, season ${season}...`);

  const client = generateClient<Schema>();

  const games = await fetchWeekScores(week, season);
  if (games.length === 0) {
    console.log("ESPN returned no games for that week — nothing to sync.");
    return;
  }

  const existing = await client.models.Game.list({
    filter: { week: { eq: week }, season: { eq: season } },
  });
  const byEspnId = new Map(existing.data.map((g) => [g.espnEventId, g]));

  let finalizedCount = 0;
  for (const game of games) {
    const current = byEspnId.get(game.espnEventId);
    if (current) {
      await client.models.Game.update({ id: current.id, ...toGameFields(game) });
    } else {
      await client.models.Game.create(toGameFields(game));
    }
    if (game.status === "FINAL") finalizedCount += 1;
  }
  console.log(`Synced ${games.length} games (${finalizedCount} final).`);

  await gradePendingPicks(client, week, games);
}

function toGameFields(game: NormalizedGame) {
  return {
    espnEventId: game.espnEventId,
    season: game.season,
    week: game.week,
    awayTeam: game.awayTeam,
    homeTeam: game.homeTeam,
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    status: game.status,
    statusDetail: game.statusDetail,
    winner: game.winner,
    startTime: game.startTime,
  };
}

async function gradePendingPicks(
  client: ReturnType<typeof generateClient<Schema>>,
  week: number,
  games: NormalizedGame[],
) {
  const finalGames = games.filter((g) => g.status === "FINAL");
  if (finalGames.length === 0) return;

  const picksRes = await client.models.Pick.list({
    filter: { week: { eq: week }, result: { eq: "PENDING" } },
  });
  const pending = picksRes.data;
  if (pending.length === 0) return;

  let graded = 0;
  for (const pick of pending) {
    const game = finalGames.find(
      (g) => g.homeTeam === pick.team || g.awayTeam === pick.team,
    );
    if (!game) continue;

    const result = pick.team === game.winner ? "WIN" : "LOSS";
    await client.models.Pick.update({ id: pick.id, result });
    graded += 1;

    if (result === "LOSS") {
      const playerRes = await client.models.Player.get({ id: pick.playerId });
      const player = playerRes.data;
      if (player && !player.isEliminated) {
        await client.models.Player.update({
          id: player.id,
          isEliminated: true,
          eliminatedWeek: pick.week,
        });
      }
    }
  }
  console.log(`Graded ${graded} pending pick(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
