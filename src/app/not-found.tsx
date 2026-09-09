import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <BrandMark size={40} />
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Incomplete pass</h1>
      <p className="text-sm text-ink-soft max-w-sm">
        That page doesn&apos;t exist — fourth down and out of bounds.
      </p>
      <Link
        href="/"
        className="mt-2 bg-gold text-ink font-semibold rounded-md px-4 py-2 text-sm hover:bg-gold-soft transition-colors"
      >
        Back to the pool
      </Link>
    </div>
  );
}
