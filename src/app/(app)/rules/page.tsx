import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { FAQS, RULES, RULES_LAST_UPDATED } from "@/lib/siteContent";

function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));
}

export default function RulesPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6">
      <header className="max-w-3xl pt-12 pb-14 sm:pt-16">
        <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-ink">
          How the pool works
        </h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
          A weekly NFL pick &apos;em. Every pick counts toward your record, and a wrong one
          doesn&apos;t knock you out.
        </p>
        <p className="mt-3 text-sm text-muted">Last updated {formatLastUpdated(RULES_LAST_UPDATED)}</p>
      </header>

      <ol className="grid gap-x-16 gap-y-12 border-t border-line pt-12 md:grid-cols-2">
        {RULES.map((rule, i) => (
          <li key={rule.id} id={rule.id} className="grid scroll-mt-32 grid-cols-[3.25rem_1fr] gap-4">
            <span className="font-display text-5xl leading-[0.9] font-bold tabular-nums text-accent">
              {i + 1}
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">{rule.title}</h2>
              <p className="mt-1.5 max-w-[46ch] leading-relaxed text-muted">{rule.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-20 grid gap-8 border-t border-line pt-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-tight text-ink">
          Frequently asked questions
        </h2>
        <div className="max-w-2xl divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.id} id={faq.id} className="group scroll-mt-32">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-medium text-ink transition-colors hover:text-muted [&::-webkit-details-marker]:hidden">
                {faq.question}
                <CaretDown
                  size={16}
                  className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
