"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
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
        title="Search (Cmd+K)"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-sunk hover:text-ink"
      >
        <MagnifyingGlass size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-20 sm:pt-28"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            className="w-full max-w-lg overflow-hidden rounded-md border border-line bg-surface shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <MagnifyingGlass size={18} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rules, FAQ, pages"
                aria-label="Search"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">
                Esc
              </kbd>
            </div>

            {query.trim() && (
              <ul className="max-h-80 overflow-y-auto p-1.5">
                {results.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-muted">No results for &quot;{query}&quot;.</li>
                ) : (
                  results.map((r) => (
                    <li key={r.href + r.title}>
                      <button
                        type="button"
                        onClick={() => go(r.href)}
                        className="w-full cursor-pointer rounded-md px-3 py-2.5 text-left transition-colors hover:bg-sunk"
                      >
                        <p className="text-sm font-medium text-ink">{r.title}</p>
                        <p className="line-clamp-1 text-xs text-muted">{r.snippet}</p>
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
