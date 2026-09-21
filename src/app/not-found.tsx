import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-5 px-4 py-24 sm:px-6">
      <BrandMark size={32} />
      <h1 className="font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.85] font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="max-w-[46ch] leading-relaxed text-muted">
        That page doesn&apos;t exist, or it has moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 active:translate-y-px"
      >
        Back to the pool
      </Link>
    </main>
  );
}
