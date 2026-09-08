## NFL Survivor Pool

A weekly pick 'em survivor pool tracker. Next.js (App Router) frontend with an
AWS Amplify Gen 2 backend (Cognito auth + AppSync/DynamoDB data).

### How it works

- Sign up / sign in with email.
- Each week, pick one NFL team to win. You can't reuse a team.
- If your pick loses, you're eliminated for the rest of the season.
- Standings show who's still alive.
- The "Commissioner" section lets any signed-in player mark a pick as a
  win or loss for now — **lock this down to a Cognito admin group before
  running a real pool**, since currently any player can grade any pick.

### Local development

```bash
npm install
npx ampx sandbox      # deploys a personal backend sandbox, writes amplify_outputs.json
npm run dev            # in a second terminal
```

### Deploying on AWS Amplify Hosting

This repo includes `amplify.yml` at the root, which Amplify Gen 2 needs
because there are two build phases: deploying the backend (Cognito + data)
and building the Next.js frontend. In the Amplify console's "App settings"
step, use **Edit YML file** and paste the contents of `amplify.yml` instead
of only filling in the "Frontend build command" box — that single field
isn't enough for a fullstack Gen 2 app.
