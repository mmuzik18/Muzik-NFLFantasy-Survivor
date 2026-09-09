"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { BrandMark } from "./BrandMark";
import { usePlayer } from "@/lib/PlayerContext";

export function Navbar() {
  const { user, signOut } = useAuthenticator((ctx) => [ctx.user]);
  const { myPlayer, admin } = usePlayer();
  const pathname = usePathname();
  const displayName = myPlayer?.displayName ?? user?.username ?? "";

  const tabs = [
    { href: "/", label: "Pool" },
    { href: "/rules", label: "Rules" },
    ...(admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-[#0b2e1d] bg-field">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark size={26} />
          <span className="font-display uppercase tracking-wide text-[#f7f3e8] text-base sm:text-lg">
            Muzik Survivor
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-lg bg-black/20 p-1">
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

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-sm">
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
        </div>
      </div>
    </header>
  );
}
