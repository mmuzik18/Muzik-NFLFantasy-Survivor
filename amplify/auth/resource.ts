import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["admins"],
  // Deliberately does NOT add a `userAttributes` entry for a display name
  // (e.g. `nickname`) here — Cognito user pool schema attributes cannot be
  // changed after the pool is created (confirmed against a real deploy:
  // "User pool attributes cannot be changed after a user pool has been
  // created", CFNUpdateNotSupportedError). The only fix is deleting and
  // recreating the pool, which destroys every existing user — completely
  // unacceptable for an already-live production pool with a real account
  // in it. The sign-up display-name field is captured entirely on the app
  // side instead — see providers.tsx and PlayerContext.tsx.
});
