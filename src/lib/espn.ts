import { NFL_TEAMS } from "./teams";

/**
 * ESPN's public, unauthenticated scoreboard endpoint. It's the same JSON
 * feed the ESPN website/app itself calls client-side — no API key, no
 * auth, read-only. Undocumented but stable and widely relied on.
 */
const SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

// ESPN's short team codes, mapped to the exact team name strings this app
// uses everywhere else (see teams.ts). Used to normalize ESPN's response
// into our own vocabulary regardless of how ESPN formats displayName.
const ABBREVIATION_TO_TEAM: Record<string, (typeof NFL_TEAMS)[number]> = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SF: "San Francisco 49ers",
  SEA: "Seattle Seahawks",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WSH: "Washington Commanders",
};

function normalizeTeam(abbreviation: string, displayName: string): string {
  return ABBREVIATION_TO_TEAM[abbreviation.toUpperCase()] ?? displayName;
}

export type GameStatus = "SCHEDULED" | "IN_PROGRESS" | "FINAL";

export type NormalizedGame = {
  espnEventId: string;
  season: number;
  week: number;
  awayTeam: string;
  homeTeam: string;
  awayScore: number | null;
  homeScore: number | null;
  status: GameStatus;
  statusDetail: string;
  winner: string | null;
  startTime: string;
};

function toStatus(state: string, completed: boolean): GameStatus {
  if (completed) return "FINAL";
  if (state === "in") return "IN_PROGRESS";
  return "SCHEDULED";
}

// Loose types for the slice of ESPN's response shape we actually read.
// The feed is undocumented, so we stay defensive rather than trusting a
// full type definition.
type EspnCompetitor = {
  homeAway: "home" | "away";
  score?: string;
  winner?: boolean;
  team: { abbreviation: string; displayName: string };
};

type EspnEvent = {
  id: string;
  date: string;
  week?: { number: number };
  competitions: Array<{
    status: { type: { state: string; completed: boolean; shortDetail?: string } };
    competitors: EspnCompetitor[];
  }>;
};

/**
 * Fetch and normalize every NFL game for a given regular-season week.
 * `seasonType` follows ESPN's convention: 1 = preseason, 2 = regular
 * season, 3 = postseason.
 */
export async function fetchWeekScores(
  week: number,
  season: number,
  seasonType: 1 | 2 | 3 = 2,
): Promise<NormalizedGame[]> {
  const url = `${SCOREBOARD_URL}?week=${week}&year=${season}&seasontype=${seasonType}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ESPN scoreboard request failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { events?: EspnEvent[] };
  const events = data.events ?? [];

  return events.map((event): NormalizedGame => {
    const competition = event.competitions[0];
    const away = competition.competitors.find((c) => c.homeAway === "away");
    const home = competition.competitors.find((c) => c.homeAway === "home");
    if (!away || !home) {
      throw new Error(`ESPN event ${event.id} is missing a home or away competitor`);
    }

    const status = toStatus(
      competition.status.type.state,
      competition.status.type.completed,
    );
    const awayScore = away.score !== undefined ? Number(away.score) : null;
    const homeScore = home.score !== undefined ? Number(home.score) : null;

    let winner: string | null = null;
    if (status === "FINAL") {
      if (away.winner) winner = normalizeTeam(away.team.abbreviation, away.team.displayName);
      else if (home.winner) winner = normalizeTeam(home.team.abbreviation, home.team.displayName);
      // else: tie — winner stays null, and every pick on this game grades as a loss.
    }

    return {
      espnEventId: event.id,
      season,
      week: event.week?.number ?? week,
      awayTeam: normalizeTeam(away.team.abbreviation, away.team.displayName),
      homeTeam: normalizeTeam(home.team.abbreviation, home.team.displayName),
      awayScore,
      homeScore,
      status,
      statusDetail: competition.status.type.shortDetail ?? "",
      winner,
      startTime: event.date,
    };
  });
}
