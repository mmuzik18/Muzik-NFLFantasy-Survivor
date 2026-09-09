"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FAQS, RULES } from "@/lib/siteContent";

type Entry = { title: string; snippet: string; href: string };

function buildIndex(admin: boolean): Entry[] {
  const entries: Entry[] = [
    { title: "Pool", snippet: "This week's matchups, your pick, and standings", href: "/" },
    { title: "Rules", snippet: "How the pool works", href: "/rules" },
    ...RULES.map((r) => ({ title: r.title, snippet: r.body, href: `/rules#${r.id}` })),
    ...FAQS.map((f) => ({ title: f.question, snippet: f.answer, href: `/rules#${f.id}` })),
  ];
  if (admin) entries.push({ title: "Admin", snippet: "Grade picks, manage players", href: "/admin" });
  return entries;
}

export function SiteSearch({ admin }: { admin: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useMemo(() => buildIndex(admin), [admin]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((e) => e.title.toLowerCase().includes(q) || e.snippet.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    (() => {
      if (open) inputRef.current?.focus();
      else setQuery("");
    })();
  }, [open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        title="Search (⌘K)"
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-[#c9c3b2] hover:text-gold-soft hover:bg-black/20 transition-colors cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/50"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            className="w-full max-w-lg rounded-xl border border-line bg-card shadow-[var(--shadow-card)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-soft shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rules, FAQ, pages..."
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
              />
              <kbd className="text-[10px] text-ink-soft border border-line rounded px-1.5 py-0.5">Esc</kbd>
            </div>

            {query.trim() && (
              <ul className="max-h-80 overflow-y-auto py-1.5">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-ink-soft">No results for &quot;{query}&quot;.</li>
                ) : (
                  results.map((r) => (
                    <li key={r.href + r.title}>
                      <button
                        type="button"
                        onClick={() => go(r.href)}
                        className="w-full text-left px-4 py-2.5 hover:bg-background transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-ink">{r.title}</p>
                        <p className="text-xs text-ink-soft line-clamp-1">{r.snippet}</p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
