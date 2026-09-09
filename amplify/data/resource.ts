import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Player: a
    .model({
      displayName: a.string().required(),
      isEliminated: a.boolean().default(false),
      eliminatedWeek: a.integer(),
    })
    .authorization((allow) => [
      allow.owner(),
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
      allow.owner(),
      allow.authenticated().to(['read', 'update']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
