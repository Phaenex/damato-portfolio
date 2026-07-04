import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { projects, sideProjects } from "@/lib/projects";
import { ResumeDownload } from "@/components/ResumeDownload";
import { ResumeTimeline } from "@/components/ResumeTimeline";
import { WorkList } from "@/components/WorkList";

function Github({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.4-5.25 5.68.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const NAV = [
  { n: "01", label: "Selected work", href: "#work" },
  { n: "02", label: "Also built", href: "#built" },
  { n: "03", label: "Experience", href: "#experience" },
  { n: "04", label: "About", href: "#about" },
  { n: "05", label: "Now", href: "/now" },
];

// At-a-glance band: the things a recruiter scans for in the first five seconds.
const GLANCE = [
  { k: "Focus", v: "Python · pandas · SQL · T-SQL · Power BI · DAX" },
  { k: "Education", v: "WCTC · AAS, AI Data Specialist (2027)" },
  { k: "Certifications", v: "CompTIA A+ · Network+ · Cisco CCNA" },
  { k: "Status", v: "Open to part-time analyst work + internships" },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1240px] lg:grid lg:grid-cols-[300px_1fr]">
      {/* ── Persistent identity rail: name, status, nav, résumé, contacts ── */}
      <aside className="flex flex-col gap-10 border-b border-line px-7 py-12 sm:px-12 lg:sticky lg:top-0 lg:h-screen lg:justify-between lg:overflow-y-auto lg:border-r lg:border-b-0 lg:px-10 lg:py-14">
        <div>
          <Image
            src="/headshot_1000.jpg"
            alt="Nicholas D'Amato"
            width={60}
            height={60}
            priority
            className="mb-5 h-[60px] w-[60px] rounded-full object-cover ring-1 ring-line-2"
          />
          <h1 className="font-serif text-[26px] font-semibold leading-[1.1] tracking-tight text-ink">
            Nicholas D&apos;Amato
          </h1>
          <p className="mt-2.5 text-sm text-[var(--accent)]">Junior Data Analyst</p>
          <p className="mt-3.5 flex items-center gap-2 text-xs text-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--accent)]" />
            Open to analyst roles &amp; internships
          </p>

          <nav aria-label="Sections" className="mt-10 flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-ring flex items-baseline gap-3.5 py-[7px] text-sm text-muted transition-colors hover:text-ink"
              >
                <span className="w-4 font-mono text-[11px] text-faint">{item.n}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-5">
          <ResumeDownload
            label="Résumé (PDF)"
            className="focus-ring inline-flex w-fit items-center gap-2 rounded border border-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--background)]"
          />
          <div className="flex flex-col gap-2.5 text-sm">
            <a
              href="mailto:nickdamatoit@gmail.com"
              className="focus-ring inline-flex items-center gap-2.5 text-muted transition-colors hover:text-[var(--accent)]"
            >
              <Mail className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
              nickdamatoit@gmail.com
            </a>
            <a
              href="https://github.com/Damatnic"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2.5 text-muted transition-colors hover:text-[var(--accent)]"
            >
              <Github className="h-3.5 w-3.5 text-faint" />
              github.com/Damatnic
            </a>
            <a
              href="https://linkedin.com/in/nicholas-damato2"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2.5 text-muted transition-colors hover:text-[var(--accent)]"
            >
              <Linkedin className="h-3.5 w-3.5 shrink-0 text-faint" />
              <span className="break-all">linkedin.com/in/nicholas-damato2</span>
            </a>
          </div>
          <p className="text-xs text-faint">Pewaukee, WI · Remote ok</p>
        </div>
      </aside>

      {/* ── Content column ── */}
      <main id="main" className="min-w-0">
        <section className="px-7 pt-14 pb-12 sm:px-12 lg:pt-24">
          <p className="eyebrow">Portfolio · Pewaukee, WI · remote ok</p>
          <h2 className="mt-4 max-w-[15ch] font-serif text-[2.5rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-[3.1rem]">
            Junior data analyst, pivoting in from IT support.
          </h2>
          <p className="mt-6 max-w-[56ch] text-[1.05rem] leading-relaxed text-body">
            Three years on service desks: ServiceNow, Active Directory, the tools
            that actually produce the data companies want to analyze. Now I&apos;m
            the one trying to read it. Finishing an AAS in AI Data Specialist at
            WCTC.
          </p>
        </section>

        {/* at a glance */}
        <dl className="grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
          {GLANCE.map((cell) => (
            <div key={cell.k} className="bg-[var(--background)] px-6 py-5">
              <dt className="eyebrow">{cell.k}</dt>
              <dd className="mt-2 text-[0.84rem] leading-snug text-ink">{cell.v}</dd>
            </div>
          ))}
        </dl>

        {/* selected work */}
        <section id="work" className="scroll-mt-6 px-7 sm:px-12">
          <WorkList projects={projects} />
        </section>

        {/* also built */}
        <section id="built" className="scroll-mt-6 px-7 pt-16 sm:px-12">
          <div className="flex items-baseline justify-between gap-4 pb-2">
            <h2 className="font-serif text-base text-ink">Also built</h2>
            <span className="font-mono text-[11px] text-faint">study tools, still in use</span>
          </div>
          <p className="mt-3 max-w-[64ch] text-[0.95rem] leading-relaxed text-body">
            The work above was assigned. These two weren&apos;t. Both run real
            code in the browser and I still use them to study.
          </p>
          <ul className="mt-2">
            {sideProjects.map((p) => (
              <li
                key={p.slug}
                className="grid gap-x-8 gap-y-2 border-t border-line py-7 sm:grid-cols-[200px_1fr]"
              >
                <div>
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-baseline gap-1.5 font-serif text-xl text-ink transition-colors hover:text-[var(--accent)]"
                  >
                    {p.title}
                    <span aria-hidden className="text-[var(--accent)]">
                      ↗
                    </span>
                  </a>
                  <div className="mt-1.5 font-mono text-[11px] text-faint">
                    {p.tech.map((t) => t.toLowerCase()).join(" · ")}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="max-w-[60ch] text-sm leading-relaxed text-body">
                    {p.description}
                  </p>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring mt-2 inline-block border-b border-line-2 pb-0.5 text-sm text-muted transition hover:text-ink"
                  >
                    Source
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* experience */}
        <section id="experience" className="scroll-mt-6 px-7 pt-16 sm:px-12">
          <ResumeTimeline />
        </section>

        {/* about */}
        <section id="about" className="scroll-mt-6 px-7 pt-16 sm:px-12">
          <h2 className="font-serif text-base text-ink">About</h2>
          <div className="mt-4 max-w-[64ch] space-y-4 text-[0.98rem] leading-[1.8] text-body">
            <p>
              Last few years I did IT support. Service desk, ticketing, AD,
              ServiceNow, some PowerShell. Being inside the systems that generate
              the data turns out to be a pretty good head start for moving into
              analytics, especially when half the job is figuring out what the
              data is actually saying versus what people{" "}
              <em className="font-serif italic text-ink">think</em>{" "}it&apos;s
              saying.
            </p>
            <p>
              The work above is real coursework from my WCTC program, cleaned up
              for public sharing. Right now I&apos;m deep in window functions and
              figuring out where pandas stops being enough and numpy starts. The{" "}
              <Link
                href="/now"
                className="focus-ring text-[var(--accent)] underline-offset-4 hover:underline"
              >
                /now
              </Link>{" "}
              page has the running log.
            </p>
          </div>
        </section>

        <footer className="mt-16 flex flex-col gap-2 border-t border-line px-7 py-8 font-mono text-[11px] tracking-wide text-faint sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <span>Nicholas D&apos;Amato · Pewaukee, WI</span>
          <span>Built with Next.js · Tailwind</span>
        </footer>
      </main>
    </div>
  );
}
