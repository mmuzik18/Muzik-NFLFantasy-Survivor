export default function RulesPage() {
  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-10">
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">
        How the pool works
      </h1>
      <p className="text-ink-soft mb-8">
        A weekly NFL pick &apos;em — every pick counts toward your record, and a wrong one
        doesn&apos;t knock you out.
      </p>

      <ol className="space-y-5">
        {[
          {
            title: "Pick one team, every week",
            body: "Each week you can pick any team playing that week, and change your mind as many times as you want, right up until that week's first game kicks off.",
          },
          {
            title: "No repeats",
            body: "Once you've picked a team, it's gone for the rest of the season — you can't take the same team twice.",
          },
          {
            title: "Every pick counts, win or lose",
            body: "If your team wins, that's a win on your record. If they lose or tie, that's a loss — either way, you keep picking every week for the rest of the season.",
          },
          {
            title: "Miss the deadline, get a random team",
            body: "If you don't pick before a week's first game starts, you're automatically assigned a random team you haven't used yet, so you're never stuck without a pick.",
          },
          {
            title: "Scores are pulled from ESPN",
            body: "Game results sync automatically from ESPN's live scoreboard, so your pick updates with the final score and outcome as soon as the game ends.",
          },
          {
            title: "Best record wins",
            body: "At the end of the season, whoever has the best win-loss record takes the pool.",
          },
        ].map((rule, i) => (
          <li key={rule.title} className="flex gap-4">
            <span className="font-score text-2xl text-gold shrink-0 w-8">{i + 1}</span>
            <div>
              <h2 className="font-semibold text-ink">{rule.title}</h2>
              <p className="text-sm text-ink-soft mt-0.5">{rule.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
