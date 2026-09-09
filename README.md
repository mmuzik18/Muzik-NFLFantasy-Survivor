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
- Once submitted, a pick can't be edited by the player — only an admin can
  correct one. This is enforced server-side (see Authorization below), not
  just hidden in the UI. The kickoff-based lock in the picking UI itself is
  a convenience on top of that, not the security boundary.
- Game scores and results sync from ESPN's public scoreboard via
  `npm run sync-scores`, which also auto-grades any pending picks whose game
  just went final.
- `/admin` (visible only to the `admins` Cognito group, linked from the nav
  when you're in it) lets an admin manually grade a pick, or manually mark a
  player eliminated for some other reason (e.g. they dropped out) — the
  `isEliminated` field still exists for that, it's just no longer set
  automatically by a loss.
- `/rules` is a public page (no sign-in required) explaining the rules —
  linked from the sign-in screen and the footer.

### Authorization

- `Player`: anyone can read; you can create/update your own row (e.g.
  display name), but `isEliminated`/`eliminatedWeek` are read-only for you —
  only the `admins` group can write them.
- `Pick`: anyone can read; you can create your own picks (tied to your
  identity server-side, so you can't submit a pick as someone else), but you
  cannot update or delete one after submitting. Only `admins` can grade or
  correct a pick.
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

1. Copy `.env.local.example` to `.env.local` and fill in the email/password
   of an account you've added to the `admins` group.
2. Run it any time — safe to re-run, games are upserted by ESPN's event id:

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
