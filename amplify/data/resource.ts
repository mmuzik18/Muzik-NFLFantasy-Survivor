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
      // Locked to create-only for the owner (field-level auth overrides
      // the model-level rule below, so it repeats every grant it still
      // needs). Without this, an owner could re-point their own pick
      // record at another player's id via update.
      playerId: a.string().required().authorization((allow) => [
        allow.ownerDefinedIn('playerId').identityClaim('sub').to(['read', 'create']),
        allow.group('admins'),
        allow.authenticated().to(['read']),
      ]),
      // Also create-only — a pick can't be moved to a different week
      // after the fact, only reassigned to a different team within the
      // same week (see `team` below).
      week: a.integer().required().authorization((allow) => [
        allow.ownerDefinedIn('playerId').identityClaim('sub').to(['read', 'create']),
        allow.group('admins'),
        allow.authenticated().to(['read']),
      ]),
      // Owner-writable on update too (inherits the model-level rule,
      // which now includes 'update') — this is what lets a player change
      // their mind before the week locks. Safe to allow at any time
      // server-side, not just before kickoff: since a pick can't be
      // reassigned to a different week (see above), editing it can only
      // ever change which of that same week's games you're riding on —
      // and before that week's first game starts, none of those games
      // have a result yet, so there's no outcome to pick with hindsight.
      // The UI still enforces the kickoff deadline for everyone's
      // clarity/fairness even though the data model doesn't strictly
      // need to.
      team: a.string().required(),
      // Grading output, not player-editable — read-only for the owner,
      // admin/system-write only (via the sync script or /admin). A plain
      // string, not a.enum(...): EnumType has no .authorization() method
      // in this SDK version, so field-level auth isn't available on it —
      // confirmed by a failed sandbox deploy. Values are "WIN" | "LOSS"
      // once graded; ungraded picks are simply null (NOT defaulted to
      // "PENDING" server-side — a .default() value gets injected into the
      // mutation input before the field-auth check runs, which made even
      // the owner's own create fail with "Unauthorized on [result]" since
      // they have no create grant on this field at all; confirmed against
      // a real deploy). The app already treats a null result as pending
      // everywhere it matters (ResultBadge, filters).
      result: a.string().authorization((allow) => [
        allow.ownerDefinedIn('playerId').identityClaim('sub').to(['read']),
        allow.group('admins'),
        allow.authenticated().to(['read']),
      ]),
    })
    .authorization((allow) => [
      // `ownerDefinedIn` ties ownership to the playerId field itself:
      // Amplify populates/validates it server-side from the caller's
      // identity, so a player can't forge another player's picks by
      // passing an arbitrary playerId. No delete — a pick can be
      // corrected but never removed outright by its owner; only an
      // admin can do that.
      allow.ownerDefinedIn('playerId').identityClaim('sub').to(['read', 'create', 'update']),
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
