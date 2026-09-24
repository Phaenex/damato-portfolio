"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Search } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toCsv } from "@/lib/csv";

type Row = {
  olympics: string;
  season: string;
  category: string;
  event: string;
  athlete: string;
  code: string;
  country: string;
  medal: "Gold" | "Silver" | "Bronze";
  continent: string;
};

const MEDAL_COLORS: Record<string, string> = {
  Gold: "#d4af37", // Premium Gold
  Silver: "#a8a29e",
  Bronze: "#a07752",
};

const CONTINENT_COLORS: Record<string, string> = {
  Americas: "#d97757",
  Asia: "#c9886d",
  Europe: "#818cf8", // Distinct cool color so Europe reads apart from the warm accent
  Oceania: "#88a87a",
  Africa: "#a07752",
};

const emptySubscribe = () => () => {};

/**
 * True only after client hydration. recharts' ResponsiveContainer measures the
 * DOM, so the charts must render client-side. useSyncExternalStore gives a
 * server snapshot of `false` and a client snapshot of `true` without a
 * set-state-in-effect (which the React hooks lint rule forbids).
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Same useSyncExternalStore approach as useHydrated, but tracks a live media
 * query instead of a one-time hydration flag: server snapshot is `false`
 * (never animate on the server), client snapshot reads matchMedia directly
 * and updates if the user flips the OS setting mid-session.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const OLYMPICS_OPTIONS = ["All", "Tokyo 2020", "Beijing 2022"] as const;
const CONTINENT_OPTIONS = [
  "All",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
  "Africa",
] as const;
const MEDAL_OPTIONS = ["Gold", "Silver", "Bronze"] as const;

export default function OlympicMedalsPage() {
  const chartsReady = useHydrated();
  const reduceMotion = usePrefersReducedMotion();
  const animateCharts = !reduceMotion;

  const [olympics, setOlympics] = useState<string>("All");
  const [continent, setContinent] = useState<string>("All");
  const [medals, setMedals] = useState<string[]>(["Gold", "Silver", "Bronze"]);
  const [search, setSearch] = useState("");

  // Dataset (1,343 rows) is fetched as a static asset rather than bundled into
  // the route's JS, so it parses as data and keeps the initial JS chunk small.
  const [data, setData] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/olympic-medals.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((rows: Row[]) => {
        if (!cancelled) setData(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = data === null && !loadError;

  const filtered = useMemo(() => {
    return (data ?? []).filter((r) => {
      if (olympics !== "All" && r.olympics !== olympics) return false;
      if (continent !== "All" && r.continent !== continent) return false;
      if (!medals.includes(r.medal)) return false;
      if (search && !r.country.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [data, olympics, continent, medals, search]);

  const stats = useMemo(() => {
    const countries = new Set(filtered.map((r) => r.country));
    const sports = new Set(filtered.map((r) => r.category));
    const athletes = new Set(filtered.map((r) => r.athlete));
    return {
      medals: filtered.length,
      countries: countries.size,
      sports: sports.size,
      athletes: athletes.size,
    };
  }, [filtered]);

  const topCountries = useMemo(() => {
    const byCountry = new Map<
      string,
      { country: string; code: string; Gold: number; Silver: number; Bronze: number; total: number }
    >();
    for (const r of filtered) {
      const e =
        byCountry.get(r.country) ?? {
          country: r.country,
          code: r.code,
          Gold: 0,
          Silver: 0,
          Bronze: 0,
          total: 0,
        };
      e[r.medal]++;
      e.total++;
      byCountry.set(r.country, e);
    }
    return Array.from(byCountry.values())
      .sort((a, b) => b.total - a.total || b.Gold - a.Gold)
      .slice(0, 10);
  }, [filtered]);

  const continentBreakdown = useMemo(() => {
    const tally = new Map<string, number>();
    for (const r of filtered) {
      tally.set(r.continent, (tally.get(r.continent) ?? 0) + 1);
    }
    return Array.from(tally.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const allCountryRows = useMemo(() => {
    const byCountry = new Map<
      string,
      { country: string; continent: string; Gold: number; Silver: number; Bronze: number; total: number }
    >();
    for (const r of filtered) {
      const e =
        byCountry.get(r.country) ?? {
          country: r.country,
          continent: r.continent,
          Gold: 0,
          Silver: 0,
          Bronze: 0,
          total: 0,
        };
      e[r.medal]++;
      e.total++;
      byCountry.set(r.country, e);
    }
    return Array.from(byCountry.values()).sort(
      (a, b) => b.total - a.total || b.Gold - a.Gold,
    );
  }, [filtered]);

  function toggleMedal(m: string) {
    setMedals((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== m);
      }
      return [...prev, m];
    });
  }

  function resetFilters() {
    setOlympics("All");
    setContinent("All");
    setMedals(["Gold", "Silver", "Bronze"]);
    setSearch("");
  }

  function downloadCsv() {
    const cols: (keyof Row)[] = [
      "olympics",
      "season",
      "category",
      "event",
      "athlete",
      "code",
      "country",
      "medal",
      "continent",
    ];
    const blob = new Blob([toCsv(filtered, cols)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `olympic-medals-${filtered.length}-rows.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main id="main" className="flex-1">
      <section className="border-b border-stone-800/60">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-10">
          <Link
            href="/#work"
            className="inline-flex items-center gap-1.5 rounded text-sm text-stone-300 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            back
          </Link>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
            Olympic Medal Pipeline
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone-300">
            1,343 medal records, scraped from Olympedia with BeautifulSoup,
            enriched with continent data, served as JSON, filtered in your
            browser. The same dataset the Python ETL produces.
          </p>
          <p className="mt-2 text-sm">
            <a
              href="https://github.com/Phaenex/olympic-medal-etl"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-[var(--accent)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              ETL source on GitHub →
            </a>
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        {loadError && (
          <div
            role="alert"
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            Couldn&apos;t load the medal dataset. Refresh to try again, or browse the{" "}
            <a
              href="https://github.com/Phaenex/olympic-medal-etl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              ETL source on GitHub
            </a>
            .
          </div>
        )}
        {/* Stats row: one dominant + three secondary */}
        <div className="grid items-end gap-8 border-b border-stone-800/60 pb-10 sm:grid-cols-[auto_1fr]">
          <div>
            <p className="font-mono text-xs text-stone-300">medals in view</p>
            <p className="mt-1 text-6xl font-semibold tracking-tight text-[var(--accent)] sm:text-7xl">
              {loading ? "…" : stats.medals.toLocaleString()}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <dt className="text-stone-300">countries</dt>
              <dd className="mt-1 text-2xl font-medium text-stone-100">
                {loading ? "…" : stats.countries}
              </dd>
            </div>
            <div>
              <dt className="text-stone-300">sports</dt>
              <dd className="mt-1 text-2xl font-medium text-stone-100">
                {loading ? "…" : stats.sports}
              </dd>
            </div>
            <div>
              <dt className="text-stone-300">athletes</dt>
              <dd className="mt-1 text-2xl font-medium text-stone-100">
                {loading ? "…" : stats.athletes}
              </dd>
            </div>
          </dl>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-medium text-stone-100">Filter the data</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={downloadCsv}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-1.5 rounded border border-stone-800 px-2.5 py-1 text-xs text-stone-300 transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-800 disabled:hover:text-stone-300"
                title="Download the rows currently in view as CSV"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download CSV
                <span className="text-stone-400">({filtered.length.toLocaleString()})</span>
              </button>
              <button
                onClick={resetFilters}
                className="rounded px-2 py-1 text-xs text-stone-300 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
              >
                reset
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FilterGroup label="Olympics">
              <div className="flex flex-wrap gap-1.5">
                {OLYMPICS_OPTIONS.map((o) => (
                  <Pill key={o} active={olympics === o} onClick={() => setOlympics(o)}>
                    {o}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Continent">
              <div className="flex flex-wrap gap-1.5">
                {CONTINENT_OPTIONS.map((c) => (
                  <Pill key={c} active={continent === c} onClick={() => setContinent(c)}>
                    {c}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Medal">
              <div className="flex flex-wrap gap-1.5">
                {MEDAL_OPTIONS.map((m) => (
                  <Pill key={m} active={medals.includes(m)} onClick={() => toggleMedal(m)}>
                    {m}
                  </Pill>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Country">
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Japan"
                  aria-label="Filter by country name"
                  className="w-full rounded border border-stone-800 bg-stone-950 py-2 pl-8 pr-3 text-sm text-stone-200 placeholder:text-stone-400 focus:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
                />
              </div>
            </FilterGroup>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h3 className="text-base font-medium text-stone-100">Top 10 countries</h3>
            <p className="mt-1 text-xs text-stone-400">Stacked by medal type.</p>
            <div
              className="mt-5 h-80 w-full min-w-0 min-h-0"
              role="img"
              aria-label="Bar chart of the top 10 countries by medal count, stacked by gold, silver, and bronze. The same figures are in the All countries table below."
            >
              {!chartsReady || loading ? (
                <ChartMountPlaceholder />
              ) : topCountries.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCountries} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#292524" vertical={false} />
                    <XAxis dataKey="code" tick={{ fill: "#d6d3d1", fontSize: 12, fontFamily: "ui-monospace, monospace" }} interval={0} tickLine={false} axisLine={{ stroke: "#44403c" }} />
                    <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c1917", border: "1px solid #44403c", borderRadius: "4px" }}
                      labelStyle={{ color: "#f5f5f4" }}
                      labelFormatter={(label, payload) => {
                        const item = (payload as ReadonlyArray<{ payload?: { country?: string } }> | undefined)?.[0]?.payload;
                        return item?.country ? `${item.country} (${String(label)})` : String(label ?? "");
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" />
                    <Bar dataKey="Gold" stackId="a" fill={MEDAL_COLORS.Gold} isAnimationActive={animateCharts} />
                    <Bar dataKey="Silver" stackId="a" fill={MEDAL_COLORS.Silver} isAnimationActive={animateCharts} />
                    <Bar dataKey="Bronze" stackId="a" fill={MEDAL_COLORS.Bronze} radius={[3, 3, 0, 0]} isAnimationActive={animateCharts} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-base font-medium text-stone-100">By continent</h3>
            <p className="mt-1 text-xs text-stone-400">Share of filtered medals.</p>
            <div
              className="mt-5 h-80 w-full min-w-0 min-h-0"
              role="img"
              aria-label="Pie chart showing the share of filtered medals by continent. The same figures are in the All countries table below."
            >
              {!chartsReady || loading ? (
                <ChartMountPlaceholder />
              ) : continentBreakdown.length === 0 ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={continentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={1} isAnimationActive={animateCharts}>
                      {continentBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={CONTINENT_COLORS[entry.name] ?? "#57534e"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1c1917", border: "1px solid #44403c", borderRadius: "4px" }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Country table */}
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-medium text-stone-100">All countries</h3>
            <p className="text-xs text-stone-400">
              {allCountryRows.length} {allCountryRows.length === 1 ? "country" : "countries"} in view
            </p>
          </div>
          <div className="mt-5 max-h-96 overflow-auto border-t border-b border-stone-800/60">
            <table className="w-full text-sm">
              <caption className="sr-only">Medal totals by country for the current filter selection</caption>
              <thead className="sticky top-0 bg-stone-950 text-xs text-stone-300">
                <tr className="border-b border-stone-800">
                  <th scope="col" className="px-2 py-2 text-left font-normal">country</th>
                  <th scope="col" className="px-2 py-2 text-left font-normal">continent</th>
                  <th scope="col" className="px-2 py-2 text-right font-normal">gold</th>
                  <th scope="col" className="px-2 py-2 text-right font-normal">silver</th>
                  <th scope="col" className="px-2 py-2 text-right font-normal">bronze</th>
                  <th scope="col" className="px-2 py-2 text-right font-normal">total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center text-stone-400">
                      Loading the dataset…
                    </td>
                  </tr>
                ) : allCountryRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-8 text-center text-stone-400">
                      No medals match the current filter.
                    </td>
                  </tr>
                ) : (
                  allCountryRows.map((row) => (
                    <tr key={row.country} className="border-b border-stone-900 hover:bg-stone-900/40">
                      <td className="px-2 py-2 text-stone-200">{row.country}</td>
                      <td className="px-2 py-2 text-stone-400">{row.continent}</td>
                      <td className="px-2 py-2 text-right text-[var(--accent)]">{row.Gold || ""}</td>
                      <td className="px-2 py-2 text-right text-stone-300">{row.Silver || ""}</td>
                      <td className="px-2 py-2 text-right text-stone-400">{row.Bronze || ""}</td>
                      <td className="px-2 py-2 text-right font-medium text-stone-100">{row.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* What I tried first */}
        <div className="border-t border-stone-800/60 pt-10 text-sm leading-relaxed text-stone-300">
          <h3 className="text-base font-medium text-stone-100">
            What I tried first that didn&apos;t work
          </h3>
          <ul className="mt-4 space-y-3">
            <li>
              <strong className="text-stone-100">
                pandas.read_html on the Olympedia medal tables.
              </strong>{" "}
              First attempt, one line of code, looked perfect. Then half the
              country cells came back NaN because the embedded flag{" "}
              <code className="rounded bg-stone-900 px-1 py-0.5 text-xs text-stone-200">
                &lt;img&gt;
              </code>{" "}
              tags broke the column inference. Switched to BeautifulSoup with
              an explicit row walker that pulled country from the{" "}
              <code className="rounded bg-stone-900 px-1 py-0.5 text-xs text-stone-200">
                alt
              </code>{" "}
              attribute of the flag image. Slower to write, way more reliable.
            </li>
            <li>
              <strong className="text-stone-100">
                Joining continent and capital at view time from SQL Server.
              </strong>{" "}
              Worked locally. Then the public demo had to be database-free, and
              the join wasn&apos;t available anymore. Moved the join into the
              ETL so the JSON ships with continent baked in. Nothing to do at
              view time except filter.
            </li>
            <li>
              <strong className="text-stone-100">
                Server-side rendering 1,343 rows into the initial HTML.
              </strong>{" "}
              Hydration time was noticeable on first load. Moved the data to a
              static JSON import and did all filtering client-side. Initial
              paint stayed fast, filter responsiveness became free.
            </li>
          </ul>
        </div>

        {/* How it works */}
        <div className="border-t border-stone-800/60 pt-10 text-sm leading-relaxed text-stone-300">
          <h3 className="text-base font-medium text-stone-100">How this works</h3>
          <p className="mt-3">
            The data on this page is the same JSON the ETL exports. The Python
            notebook scrapes the Tokyo 2020 and Beijing 2022 medal pages from
            Olympedia, parses them with BeautifulSoup (pandas.read_html choked
            on embedded flag image tags), and joins against a SQL Server{" "}
            <code className="rounded bg-stone-900 px-1 py-0.5 text-xs text-stone-200">World</code> database for
            continent and capital. Those fields are baked into this file for the
            public demo so nothing needs a database at view time.
          </p>
          <p className="mt-3">
            The charts and table are filtered client-side from the same
            1,343-row file. ETL source lives on{" "}
            <a href="https://github.com/Phaenex/olympic-medal-etl" target="_blank" rel="noopener noreferrer" className="rounded text-[var(--accent)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950">
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-300">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 " +
        (active
          ? "border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-stone-800 bg-stone-950 text-stone-200 hover:border-stone-700 hover:text-stone-100")
      }
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-stone-400">
      No data matches the current filter.
    </div>
  );
}

function ChartMountPlaceholder() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full w-full items-center justify-center rounded border border-dashed border-stone-800 bg-stone-900/20 text-xs text-stone-400"
    >
      Loading charts…
    </div>
  );
}
