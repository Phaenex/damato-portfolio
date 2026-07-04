"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";

// The sidebar/filter uses plain "SQL"; flagship projects tag T-SQL / SQL Server.
const TECH_FILTER_ALIASES: Record<string, string[]> = {
  SQL: ["T-SQL", "SQL Server"],
};

function projectUsesFilterTech(projectTech: string[], filter: string): boolean {
  if (filter === "All") return true;
  const needles = TECH_FILTER_ALIASES[filter] ?? [filter];
  return needles.some((n) => projectTech.includes(n));
}

const FILTER_TECH = ["Python", "SQL", "Power BI", "pandas", "ETL", "DAX"];

export function WorkList({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", ...FILTER_TECH];
  const filtered =
    filter === "All"
      ? projects
      : projects.filter((p) => projectUsesFilterTech(p.tech, filter));

  return (
    <>
      <div className="flex items-baseline justify-between gap-4 pt-16 pb-4">
        <h2 className="font-serif text-base text-ink">Selected work</h2>
        <span className="font-mono text-[11px] text-faint">
          {filtered.length} of {projects.length}
        </span>
      </div>

      <div
        role="group"
        aria-label="Filter projects by technology"
        className="flex flex-wrap gap-x-5 gap-y-2 pb-2"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`focus-ring font-mono text-xs tracking-wide transition-colors ${
              filter === f
                ? "text-[var(--accent)] underline decoration-[var(--accent)] underline-offset-4"
                : "text-faint hover:text-muted"
            }`}
          >
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="border-t border-line py-10 text-sm text-muted">
          No flagship project tagged {filter}. The side projects below use a wider stack.
        </p>
      ) : (
        <ol>
          {filtered.map((p, i) => (
            <li
              key={p.slug}
              className="grid grid-cols-[2.25rem_1fr] gap-x-4 border-t border-line py-9 first:border-t-0 sm:gap-x-6"
            >
              <div className="pt-2 font-mono text-xs text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <article className="min-w-0">
                <h3 className="font-serif text-2xl leading-tight tracking-tight text-ink sm:text-[1.7rem]">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[0.95rem] text-muted">{p.tagline}</p>
                <p className="mt-3.5 max-w-[64ch] text-[0.95rem] leading-relaxed text-body">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="font-mono text-[11px] tracking-wide text-faint">
                    {p.tech.map((t) => t.toLowerCase()).join(" · ")}
                  </span>
                  <span className="flex shrink-0 gap-5 text-sm">
                    {p.demoUrl && (
                      <Link
                        href={p.demoUrl}
                        className="focus-ring border-b border-[var(--accent)] pb-0.5 font-medium text-[var(--accent)] transition hover:opacity-80"
                      >
                        {p.demoLabel ?? "Open"} →
                      </Link>
                    )}
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring border-b border-line-2 pb-0.5 text-muted transition hover:text-ink"
                    >
                      Source
                    </a>
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
