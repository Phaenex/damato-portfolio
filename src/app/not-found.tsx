import Link from "next/link";

export const metadata = {
  title: "Page not found · Nicholas D'Amato",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex max-w-2xl flex-1 flex-col items-start justify-center px-6 py-24"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
        That page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-prose leading-relaxed text-stone-300">
        Probably a stale link or a typo. The work is on the homepage. Three
        flagship projects and a few side things.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md border border-[var(--accent)]/50 bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
      >
        ← Back to the homepage
      </Link>
    </main>
  );
}
