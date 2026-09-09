"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/BrandMark";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <BrandMark size={40} />
      <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Flag on the play</h1>
      <p className="text-sm text-ink-soft max-w-sm">
        Something went wrong loading the pool. Try again — if it keeps happening, let the
        commissioner know.
      </p>
      <button
        onClick={reset}
        className="mt-2 bg-gold text-ink font-semibold rounded-md px-4 py-2 text-sm hover:bg-gold-soft transition-colors cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
