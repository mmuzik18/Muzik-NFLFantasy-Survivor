import { FAQS, RULES, RULES_LAST_UPDATED } from "@/lib/siteContent";

function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(iso));
}

export default function RulesPage() {
  return (
    <main id="main-content" className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-10">
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink mb-2">
        How the pool works
      </h1>
      <p className="text-ink-soft mb-1">
        A weekly NFL pick &apos;em — every pick counts toward your record, and a wrong one
        doesn&apos;t knock you out.
      </p>
      <p className="text-xs text-ink-soft/70 mb-8">
        Last updated {formatLastUpdated(RULES_LAST_UPDATED)}
      </p>

      <ol className="space-y-5">
        {RULES.map((rule, i) => (
          <li key={rule.id} id={rule.id} className="flex gap-4 scroll-mt-24">
            <span className="font-score text-2xl text-gold shrink-0 w-8">{i + 1}</span>
            <div>
              <h2 className="font-semibold text-ink">{rule.title}</h2>
              <p className="text-sm text-ink-soft mt-0.5">{rule.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="font-display text-xl uppercase tracking-wide text-ink mt-12 mb-4">
        Frequently asked questions
      </h2>
      <div className="space-y-2">
        {FAQS.map((faq) => (
          <details
            key={faq.id}
            id={faq.id}
            className="group rounded-lg border border-line bg-card scroll-mt-24 open:shadow-[var(--shadow-card)]"
          >
            <summary className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink cursor-pointer list-none hover:text-gold-soft transition-colors">
              {faq.question}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="px-4 pb-3.5 text-sm text-ink-soft">{faq.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
