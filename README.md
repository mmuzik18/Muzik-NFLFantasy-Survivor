## NFL Survivor Pool

A weekly pick 'em survivor pool tracker. Next.js (App Router) frontend with an
AWS Amplify Gen 2 backend (Cognito auth + AppSync/DynamoDB data).

### How it works

- Sign up / sign in with email.
- Each week, pick one NFL team to win. You can't reuse a team.
- If your pick loses (or ties), you're eliminated for the rest of the season.
- Once submitted, a pick can't be edited by the player — only an admin can
  correct one. This is enforced server-side (see Authorization below), not
  just hidden in the UI.
- Standings show who's still alive.
- Game scores and results sync from ESPN's public scoreboard via
  `npm run sync-scores`, which also auto-grades any pending picks whose game
  just went final. See "Syncing NFL scores" below.
- A "Commissioner" panel (visible only to the `admins` Cognito group) lets an
  admin manually grade a pick, for the rare case the auto-sync needs a
  correction.
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

### Becoming an admin (commissioner)

Grading picks and syncing scores requires a Cognito user in the `admins`
group. After signing up your own account once, add yourself via the AWS CLI
(or the Cognito console → your user pool → Users → your user → Add to group):

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <from amplify_outputs.json: auth.user_pool_id> \
  --username <your email> \
  --group-name admins
```

### Syncing NFL scores

`scripts/sync-scores.ts` pulls the current week's scores from ESPN's public
scoreboard, upserts them into the `Game` model, and auto-grades any pending
picks whose game just finished (marking the picker eliminated on a loss).

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
