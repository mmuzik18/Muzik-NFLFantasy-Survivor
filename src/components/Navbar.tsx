"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { List, X } from "@phosphor-icons/react";
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
    <header className="no-print sticky top-0 z-20 border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandMark size={26} />
          <span className="text-[15px] font-semibold tracking-tight text-ink">Muzik Survivor</span>
        </Link>

        <nav aria-label="Main" className="hidden h-full items-stretch gap-6 sm:flex">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center border-b-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-1 sm:flex">
          <SiteSearch admin={admin} />
          <ThemeToggle />
          <span className="mx-3 h-5 w-px bg-line" aria-hidden="true" />
          {myPlayer ? (
            <EditableName name={displayName} onSave={updateDisplayName} />
          ) : (
            <span className="text-sm font-medium text-ink">{displayName}</span>
          )}
          <button
            onClick={signOut}
            className="ml-3 cursor-pointer rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-sunk hover:text-ink"
          >
            Sign out
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <SiteSearch admin={admin} />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-sunk hover:text-ink"
          >
            {mobileOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-paper px-4 pt-2 pb-4 sm:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-3 text-[15px] font-medium transition-colors ${
                    active ? "bg-sunk text-ink" : "text-muted hover:bg-sunk hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-line px-3 pt-4">
            <div className="min-w-0 truncate">
              {myPlayer ? (
                <EditableName name={displayName} onSave={updateDisplayName} />
              ) : (
                <span className="text-sm font-medium text-ink">{displayName}</span>
              )}
            </div>
            <button
              onClick={signOut}
              className="shrink-0 cursor-pointer rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:bg-sunk"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
