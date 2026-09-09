import { fetchWeekScores } from "@/lib/espn";
import { currentNflSeason, currentNflWeekGuess } from "@/lib/nflWeek";

// Thin server-side proxy for ESPN's public scoreboard — the client polls
// this instead of calling ESPN directly, which avoids CORS entirely and
// keeps the fetch/parsing logic in one place (src/lib/espn.ts). The data
// is public NFL schedule/score info, same as scores.espn.com shows, so
// this route is intentionally not gated by admin auth.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const weekParam = Number(searchParams.get("week"));
  const seasonParam = Number(searchParams.get("season"));
  const week = Number.isFinite(weekParam) && weekParam > 0 ? weekParam : currentNflWeekGuess(now);
  const season = Number.isFinite(seasonParam) && seasonParam > 0 ? seasonParam : currentNflSeason(now);

  try {
    const games = await fetchWeekScores(week, season);
    return Response.json({ week, season, games });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
