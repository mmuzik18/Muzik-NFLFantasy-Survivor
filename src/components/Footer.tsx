import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#0b2e1d] bg-field">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8f8a7b]">
        <p>&copy; {new Date().getFullYear()} Muzik NFL Survivor. Just for fun among friends.</p>
        <nav className="flex items-center gap-4">
          <Link href="/rules" className="hover:text-gold-soft transition-colors">
            Rules
          </Link>
          <a
            href="https://www.espn.com/nfl/scoreboard"
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-gold-soft transition-colors"
          >
            NFL scores (ESPN)
          </a>
        </nav>
      </div>
    </footer>
  );
}
