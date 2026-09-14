"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { BrandMark } from "./BrandMark";
import { EditableName } from "./EditableName";
import { ThemeToggle } from "./ThemeToggle";
import { SiteSearch } from "./SiteSearch";
import { usePlayer } from "@/lib/PlayerContext";

export function Navbar() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);
  const { myPlayer, admin, updateDisplayName } = usePlayer();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = myPlayer?.displayName ?? user?.username ?? "";

  // Close the mobile menu on route change so it doesn't stay open after
  // tapping a link.
  useEffect(() => {
    (() => setMobileOpen(false))();
  }, [pathname]);

  const tabs = [
    { href: "/", label: "Pool" },
    { href: "/rules", label: "Rules" },
    ...(admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="no-print sticky top-0 z-20 border-b border-[#0b2e1d] bg-field">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={26} />
          <span className="font-display uppercase tracking-wide text-[#f7f3e8] text-base sm:text-lg">
            Muzik Survivor
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 rounded-lg bg-black/20 p-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-gold text-ink" : "text-[#c9c3b2] hover:text-[#f7f3e8]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-3 sm:gap-4">
          <SiteSearch admin={admin} />
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm">
            {myPlayer ? (
              <EditableName name={displayName} onSave={updateDisplayName} />
            ) : (
              <span className="text-[#f7f3e8] font-medium">{displayName}</span>
            )}
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
        </div>

        <div className="flex sm:hidden items-center gap-1">
          <SiteSearch admin={admin} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="w-9 h-9 flex items-center justify-center rounded-md text-[#c9c3b2] hover:text-gold-soft hover:bg-black/20 transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-[#0b2e1d] bg-field px-4 pb-4 pt-2 flex flex-col gap-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-gold text-ink" : "text-[#c9c3b2] hover:bg-black/20 hover:text-[#f7f3e8]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#2d4436] mt-1 pt-3">
            <div className="flex items-center gap-2 text-sm min-w-0">
              {myPlayer ? (
                <EditableName name={displayName} onSave={updateDisplayName} />
              ) : (
                <span className="text-[#f7f3e8] font-medium truncate">{displayName}</span>
              )}
              {admin && (
                <span className="shrink-0 rounded-full bg-gold/20 text-gold-soft text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                  Admin
                </span>
              )}
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-left text-[#c9c3b2] border border-[#2d4436] rounded-md px-3 py-2 hover:border-gold hover:text-gold-soft transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
