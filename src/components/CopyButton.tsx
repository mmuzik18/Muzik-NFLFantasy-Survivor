"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (very old browser, insecure context).
      // Nothing sensible to fall back to here, so skip the "Copied"
      // confirmation.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
