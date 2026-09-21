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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center gap-5 px-4 py-24 sm:px-6">
      <BrandMark size={32} />
      <h1 className="font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.85] font-bold tracking-tight text-ink">
        Something went wrong
      </h1>
      <p className="max-w-[46ch] leading-relaxed text-muted">
        The pool didn&apos;t load. Try again, and if it keeps happening, let the commissioner know.
      </p>
      <button
        onClick={reset}
        className="cursor-pointer rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 active:translate-y-px"
      >
        Try again
      </button>
    </main>
  );
}
