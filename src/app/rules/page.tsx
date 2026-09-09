import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rules",
  description: "How the Muzik NFL Survivor pool works.",
};

export default function RulesPage() {
  return (
    <>
      <header className="border-b border-[#0b2e1d] bg-field">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="font-display uppercase tracking-wide text-[#f7f3e8] text-base sm:text-lg">
              Muzik Survivor
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#c9c3b2] border border-[#2d4436] rounded-md px-3 py-1.5 hover:border-gold hover:text-gold-soft transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10">
        <h1 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">
          How the pool works
        </h1>
        <p className="text-ink-soft mb-8">
          A classic NFL survivor pool — simple rules, one wrong pick and you&apos;re out.
        </p>

        <ol className="space-y-5">
          {[
            {
              title: "Pick one team, every week",
              body: "Each week you pick exactly one NFL team you think will win their game.",
            },
            {
              title: "No repeats",
              body: "Once you've picked a team, it's gone for the rest of the season — you can't take the same team twice.",
            },
            {
              title: "Win and you survive",
              body: "If your team wins, you move on to next week. If your team loses or ties, you're eliminated.",
            },
            {
              title: "Scores are pulled from ESPN",
              body: "Game results sync automatically from ESPN's live scoreboard, so your pick updates with the final score and outcome as soon as the game ends.",
            },
            {
              title: "Last one standing wins",
              body: "Once every player but one has been eliminated, that player wins the pool. If everyone gets eliminated in the same week, the pool commissioner decides how ties are broken.",
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

      <Footer />
    </>
  );
}
