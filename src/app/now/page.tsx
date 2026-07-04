import Link from "next/link";
import { nowEntries } from "@/data/now";

const NOW_DESC = "What I'm working on right now. Dated log, most recent first.";

export const metadata = {
  title: "Now | Nicholas D'Amato",
  description: NOW_DESC,
  alternates: { canonical: "/now" },
  openGraph: {
    title: "Now | Nicholas D'Amato",
    description: NOW_DESC,
    type: "website",
    url: "/now",
  },
  twitter: {
    card: "summary_large_image",
    title: "Now | Nicholas D'Amato",
    description: NOW_DESC,
  },
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function NowPage() {
  return (
    <main
      id="main"
      className="mx-auto max-w-3xl px-6 py-12 text-stone-100 selection:bg-[var(--accent)] selection:text-stone-950"
    >
      <header className="mb-12">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
          Working log · newest first
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Now
        </h1>
        <p className="mt-5 max-w-[60ch] leading-relaxed text-body">
          What I&apos;m working on and thinking about. Updated when something
          actually changes, not on a schedule.
        </p>
        <p className="mt-5 text-sm">
          <Link
            href="/"
            className="focus-ring text-muted underline-offset-4 hover:text-[var(--accent)] hover:underline"
          >
            ← back to portfolio
          </Link>
        </p>
      </header>

      <ol>
        {nowEntries.map((entry) => (
          <li
            key={entry.date}
            className="grid gap-x-8 gap-y-2 border-t border-line py-8 sm:grid-cols-[140px_1fr]"
          >
            <time
              dateTime={entry.date}
              className="pt-0.5 font-mono text-xs uppercase tracking-wider text-faint"
            >
              {formatDate(entry.date)}
            </time>
            <div className="min-w-0">
              <p className="text-[1.05rem] text-ink">{entry.summary}</p>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-body">
                {entry.items.map((it, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span aria-hidden="true" className="text-[var(--accent)]">
                      —
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <footer className="mt-12 border-t border-line pt-6 text-xs text-faint">
        <p>
          Format inspired by{" "}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noreferrer"
            className="rounded text-stone-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          >
            nownownow.com
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
