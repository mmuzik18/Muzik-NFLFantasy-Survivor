"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { BrandMark } from "./BrandMark";
import { isAdmin } from "@/lib/authGroups";

export function Navbar({ displayName }: { displayName: string }) {
  const { signOut } = useAuthenticator((ctx) => [ctx.user]);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    isAdmin().then(setAdmin);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-[#0b2e1d] bg-field">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={26} />
          <span className="font-display uppercase tracking-wide text-[#f7f3e8] text-base sm:text-lg">
            Muzik Survivor
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/rules"
            className="hidden sm:inline text-sm text-[#c9c3b2] hover:text-gold-soft transition-colors"
          >
            Rules
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#f7f3e8] font-medium">{displayName}</span>
            {admin && (
              <span className="rounded-full bg-gold/20 text-gold-soft text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={signOut}
            className="text-sm text-[#c9c3b2] border border-[#2d4436] rounded-md px-3 py-1.5 hover:border-gold hover:text-gold-soft transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
