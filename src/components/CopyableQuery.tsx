"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyableQueryProps {
  title: string;
  why: string;
  sql: string;
}

export function CopyableQuery({ title, why, sql }: CopyableQueryProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API can fail in iframes or insecure origins. Silent no-op.
    }
  }

  return (
    <figure className="mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
      <div className="flex items-baseline justify-between gap-3 border-b border-stone-800 bg-stone-900/60 px-4 py-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
            SQL
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-stone-100">{title}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy query"}
          aria-live="polite"
          className="inline-flex shrink-0 items-center gap-1.5 rounded border border-stone-800 bg-stone-900 px-2 py-1 text-[11px] text-stone-300 hover:border-stone-600 hover:text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-stone-200">
        <code>{sql}</code>
      </pre>
      <figcaption className="border-t border-stone-800 bg-stone-950 px-4 py-3 text-xs text-stone-400">
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400">
          why
        </span>
        <span className="ml-2 text-stone-300">{why}</span>
      </figcaption>
    </figure>
  );
}
