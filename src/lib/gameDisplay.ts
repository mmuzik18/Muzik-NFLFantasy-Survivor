import type { Schema } from "../../amplify/data/resource";

type Pick = Schema["Pick"]["type"];
type Game = Schema["Game"]["type"];

export type PickWithGame = {
  pick: Pick;
  game: Game | null;
  opponent: string | null;
  isHome: boolean;
  pickScore: number | null;
  opponentScore: number | null;
};

function findGameForPick(games: Game[], pick: Pick): Game | undefined {
  return games.find(
    (g) => g.week === pick.week && (g.homeTeam === pick.team || g.awayTeam === pick.team),
  );
}

/** Join each pick with its matching game (by week + team) for display. */
export function attachGames(picks: Pick[], games: Game[]): PickWithGame[] {
  return picks.map((pick) => {
    const game = findGameForPick(games, pick);
    if (!game) {
      return { pick, game: null, opponent: null, isHome: false, pickScore: null, opponentScore: null };
    }
    const isHome = game.homeTeam === pick.team;
    return {
      pick,
      game,
      opponent: isHome ? game.awayTeam : game.homeTeam,
      isHome,
      pickScore: isHome ? (game.homeScore ?? null) : (game.awayScore ?? null),
      opponentScore: isHome ? (game.awayScore ?? null) : (game.homeScore ?? null),
    };
  });
}
