// Shared source of truth for the Rules page's content — also feeds
// SiteSearch, so every entry needs a stable `id` to deep-link to
// (/rules#id) and to key the FAQ's <details> elements.

export const RULES_LAST_UPDATED = "2026-09-01";

export const RULES = [
  {
    id: "pick-weekly",
    title: "Pick one team, every week",
    body: "Each week you can pick any team playing that week, and change your mind as many times as you want, right up until that week's first game kicks off.",
  },
  {
    id: "no-repeats",
    title: "No repeats",
    body: "Once you've picked a team, it's gone for the rest of the season — you can't take the same team twice.",
  },
  {
    id: "every-pick-counts",
    title: "Every pick counts, win or lose",
    body: "If your team wins, that's a win on your record. If they lose or tie, that's a loss — either way, you keep picking every week for the rest of the season.",
  },
  {
    id: "missed-deadline",
    title: "Miss the deadline, get a random team",
    body: "If you don't pick before a week's first game starts, you're automatically assigned a random team you haven't used yet, so you're never stuck without a pick.",
  },
  {
    id: "espn-scores",
    title: "Scores are pulled from ESPN",
    body: "Game results sync automatically from ESPN's live scoreboard, so your pick updates with the final score and outcome as soon as the game ends.",
  },
  {
    id: "best-record-wins",
    title: "Best record wins",
    body: "At the end of the season, whoever has the best win-loss record takes the pool.",
  },
] as const;

export const FAQS = [
  {
    id: "faq-change-pick",
    question: "Can I change my pick after I've made it?",
    answer:
      "Yes — up until the first game of that week kicks off. After that, the pick locks in for grading.",
  },
  {
    id: "faq-tie",
    question: "What happens if my team ties?",
    answer: "A tie counts as a loss on your record, same as an outright loss.",
  },
  {
    id: "faq-bye-week",
    question: "What if my usual pick is on a bye week?",
    answer: "You can only pick from teams actually playing that week, so a bye week team won't show up as an option.",
  },
  {
    id: "faq-eliminated",
    question: "Do I get eliminated after enough losses?",
    answer:
      "No — this pool tracks win-loss record, not sudden elimination. You keep picking every week all season; the best record at the end wins. (\"Eliminated\" status is a separate manual admin override, not something a normal loss triggers.)",
  },
  {
    id: "faq-scores-wrong",
    question: "A score looks wrong or hasn't updated — what do I do?",
    answer: "Scores sync from ESPN automatically. If something looks off, use the contact button in the corner to flag it to the commissioner.",
  },
] as const;
