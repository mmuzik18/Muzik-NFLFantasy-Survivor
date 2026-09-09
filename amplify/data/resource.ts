import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Player: a
    .model({
      displayName: a.string().required(),
      // Elimination state is grading output, not player-editable profile
      // data — field-level auth overrides the model-level rule below, so
      // it must repeat every grant this field still needs, including
      // authenticated read (standings shows everyone's status, not just
      // your own).
      isEliminated: a.boolean().default(false).authorization((allow) => [
        allow.owner().to(['read']),
        allow.group('admins'),
        allow.authenticated().to(['read']),
      ]),
      eliminatedWeek: a.integer().authorization((allow) => [
        allow.owner().to(['read']),
        allow.group('admins'),
        allow.authenticated().to(['read']),
      ]),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('admins'),
      allow.authenticated().to(['read']),
    ]),

  Pick: a
    .model({
      playerId: a.string().required(),
      week: a.integer().required(),
      team: a.string().required(),
      result: a.enum(['PENDING', 'WIN', 'LOSS']),
    })
    .authorization((allow) => [
      // `ownerDefinedIn` ties ownership to the playerId field itself:
      // Amplify populates/validates it server-side from the caller's
      // identity, so a player can't forge another player's picks by
      // passing an arbitrary playerId. Read+create only — no update or
      // delete — so a pick can't be edited (e.g. to fix its own result)
      // after submission; only an admin can correct one.
      allow.ownerDefinedIn('playerId').identityClaim('sub').to(['read', 'create']),
      allow.group('admins'),
      allow.authenticated().to(['read']),
    ]),

  // Final/live NFL game data, synced from ESPN's public scoreboard by the
  // `npm run sync-scores` script (see scripts/sync-scores.ts). Players only
  // ever read this model; only the `admins` group can write to it.
  Game: a
    .model({
      espnEventId: a.string().required(),
      season: a.integer().required(),
      week: a.integer().required(),
      awayTeam: a.string().required(),
      homeTeam: a.string().required(),
      awayScore: a.integer(),
      homeScore: a.integer(),
      status: a.enum(['SCHEDULED', 'IN_PROGRESS', 'FINAL']),
      statusDetail: a.string(),
      winner: a.string(),
      startTime: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.group('admins'),
      allow.authenticated().to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
