"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "./CopyButton";
import { COMMISSIONER_EMAIL } from "@/lib/siteContent";

export function Footer() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    (() => setOrigin(window.location.origin))();
  }, []);

  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Muzik NFL Survivor. Just for fun among friends.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/rules" className="transition-colors hover:text-ink">
            Rules
          </Link>
          <a
            href="https://www.espn.com/nfl/scoreboard"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-ink"
          >
            NFL scores (ESPN)
          </a>
          <a
            href={`mailto:${COMMISSIONER_EMAIL}?subject=Muzik%20NFL%20Survivor`}
            className="transition-colors hover:text-ink"
          >
            Contact the commissioner
          </a>
          {origin && <CopyButton text={origin} label="Copy invite link" />}
        </nav>
      </div>
    </footer>
  );
}
