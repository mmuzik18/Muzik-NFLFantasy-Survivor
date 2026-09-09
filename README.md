## NFL Survivor Pool

A weekly NFL pick 'em tracker — every pick counts toward a season win-loss
record; a wrong pick doesn't eliminate you. Next.js (App Router) frontend
with an AWS Amplify Gen 2 backend (Cognito auth + AppSync/DynamoDB data).

### How it works

- Sign up / sign in with email.
- Each week you can pick any team playing that week, right up until that
  week's first game kicks off — pick, change your mind, pick again, as much
  as you want before then. The next week doesn't open up until every game
  from the current week has finished. Tabs across the top let you browse any
  week's games/results, past or upcoming.
- A win or loss just records to your season record — it never eliminates
  you, you keep picking every week regardless. Standings are sorted by
  record (wins, then fewest losses).
- If you miss the deadline entirely, `npm run sync-scores` auto-assigns a
  random team you haven't used yet, so you're never just stuck — see
  "Syncing NFL scores" below.
- A player can change which team they've picked for the current week as
  many times as they want — the "confirm" step just saves the current
  choice, it doesn't lock it in. `result` and `week` can never be touched
  by the player, though (see Authorization below), so this can't be used
  to self-grade a pick or move it to a different week; only an admin can
  fix either of those.
- Game scores and results sync from ESPN's public scoreboard via
  `npm run sync-scores`, which also auto-grades any pending picks whose game
  just went final.
- `/admin` (visible only to the `admins` Cognito group, appears as a tab
  once you're in it) lets an admin grade or delete any pick, and manually
  mark a player eliminated for some other reason (e.g. they dropped out) —
  the `isEliminated` field still exists for that, it's just no longer set
  automatically by a loss.
- `/rules` and `/admin` are tabs inside the signed-in app, alongside the
  pool itself — there's no public, signed-out version of either.

### Authorization

- `Player`: anyone can read; you can create/update your own row (e.g.
  display name), but `isEliminated`/`eliminatedWeek` are read-only for you —
  only the `admins` group can write them.
- `Pick`: anyone can read. You can create your own picks (tied to your
  identity server-side via `ownerDefinedIn`, so you can't submit one as
  someone else) and update `team` on your own pick — that's what lets you
  change your mind before a week locks. `playerId` and `week` are
  create-only even for the owner (a pick can't be reassigned to another
  player or moved to a different week), and `result` is read-only for the
  owner (grading is admin/system-only). No delete for the owner — only an
  admin can remove a pick outright. This was verified against the actual
  deployed resolvers (`aws appsync get-function` on the auth steps), not
  just the schema source, since field-level auth on a model's own owner
  field is an unusual enough configuration to want to check.
- `Game`: anyone can read; only `admins` can write (via the sync script).

### Local development

```bash
npm install
npx ampx sandbox      # deploys a personal backend sandbox, writes amplify_outputs.json
npm run dev            # in a second terminal
```

### Syncing NFL scores

`scripts/sync-scores.ts` pulls the current week's scores from ESPN's public
scoreboard, upserts them into the `Game` model, auto-assigns a random
still-available team to any active player who missed the pick deadline, and
auto-grades any pending picks whose game just finished (a loss just records
as a loss — see "How it works" above).

It always targets the deployed **production** app (the Amplify Hosting
branch deployment), never your local sandbox — `ampx sandbox` and a branch
deployment are separate Amplify environments with their own Cognito pool
and data, so running it against sandbox outputs would update data nobody
actually sees.

1. Generate `amplify_outputs.production.json` (gitignored, one-time unless
   the backend's resource ids change) — this is a different file from the
   plain `amplify_outputs.json` that `npx ampx sandbox` / `npm run dev`
   use:

   ```bash
   npx ampx generate outputs --app-id d3kdwfj51a98to --branch main
   mv amplify_outputs.json amplify_outputs.production.json
   npx ampx sandbox --once   # regenerates the sandbox amplify_outputs.json
   ```

2. Copy `.env.local.example` to `.env.local` and fill in the email/password
   of an account you've added to the `admins` group **in the production
   Cognito pool** — check which pool an account is in before assuming; a
   user created in the sandbox pool won't exist in production or vice
   versa. `auth.user_pool_id` in `amplify_outputs.production.json` names
   the right one.
3. Run it any time — safe to re-run, games are upserted by ESPN's event id:

   ```bash
   npm run sync-scores                    # current week, current season
   npm run sync-scores -- --week 3 --season 2026
   ```

For live updates during game day, run it on a schedule (cron, a scheduled
GitHub Action, etc.) — e.g. every 15 minutes while games are in progress.

### Deploying on AWS Amplify Hosting

This repo includes `amplify.yml` at the root, which Amplify Gen 2 needs
because there are two build phases: deploying the backend (Cognito + data)
and building the Next.js frontend. In the Amplify console's "App settings"
step, use **Edit YML file** and paste the contents of `amplify.yml` instead
of only filling in the "Frontend build command" box — that single field
isn't enough for a fullstack Gen 2 app.
