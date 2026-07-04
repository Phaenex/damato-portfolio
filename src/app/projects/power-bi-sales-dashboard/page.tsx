import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileDown } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { projects } from "@/lib/projects";
import { projectJsonLd } from "@/lib/jsonLd";

const project = projects.find((p) => p.slug === "power-bi-sales-dashboard")!;

export const metadata = {
  title: "Power BI Sales Dashboard | Nicholas D'Amato",
  description:
    "Three-page Power BI dashboard built on a star schema. DAX measures for KPIs, drill-through pages, employee scorecard, and salary-vs-review analysis.",
  alternates: { canonical: "/projects/power-bi-sales-dashboard" },
  openGraph: {
    title: "Power BI Sales Dashboard | Nicholas D'Amato",
    description:
      "Three-page Power BI dashboard on a star schema: DAX measures, drill-through, employee scorecard, and salary-vs-review analysis.",
    type: "article",
    url: "/projects/power-bi-sales-dashboard",
    images: ["/projects/power-bi-sales-dashboard/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Power BI Sales Dashboard | Nicholas D'Amato",
    description:
      "Three-page Power BI dashboard on a star schema: DAX measures, drill-through, employee scorecard, and salary-vs-review analysis.",
    images: ["/projects/power-bi-sales-dashboard/opengraph-image"],
  },
};

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-12 text-xl font-semibold tracking-tight text-stone-100 sm:text-2xl">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 text-base font-medium text-stone-100">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-stone-900 px-1 py-0.5 text-xs text-stone-200">{children}</code>
  );
}

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-stone-800 bg-stone-950">
      {label && (
        <div className="border-b border-stone-800 bg-stone-900/60 px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-400">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-stone-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function PowerBICaseStudy() {
  return (
    <main id="main" className="flex-1">
      <JsonLd data={projectJsonLd(project)} />
      <section className="border-b border-stone-800/60">
        <div className="mx-auto max-w-3xl px-6 pt-10 pb-10">
          <Link
            href="/#work"
            className="inline-flex items-center gap-1.5 rounded text-sm text-stone-300 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            back
          </Link>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
            Power BI Sales Dashboard
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone-300">
            Three-page interactive dashboard on an AdventureWorks-style sales
            data model. Star schema with a Sales fact and five dimensions, DAX
            measures for the KPIs, slicer-driven filtering for ad-hoc
            exploration, and drill-through pages for digging into individual
            employees.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <a
              href="https://github.com/Damatnic/power-bi-sales-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded text-[var(--accent)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Source on GitHub
            </a>
            <span className="text-stone-400">·</span>
            <a
              href="https://github.com/Damatnic/power-bi-sales-dashboard/archive/main.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded text-stone-300 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Download ZIP (PBIP)
            </a>
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-12 leading-relaxed text-stone-300">
        <H2 id="data-model">The data model</H2>
        <p className="mt-3">
          Classic star schema. Sales is the fact table. Five dimensions hang off
          it: Employee, Date, Product, Promotion, and Sales Reviews. The Sales
          Reviews dimension is joined to Employee at 1:1 because review scores
          live per-employee, not per-transaction.
        </p>
        <CodeBlock label="relationships">{`        Date ───────────┐
                        │
    Promotion ───────── Sales ─────── Product
                        │
                     Employee ─── Sales Reviews`}</CodeBlock>

        <H3>Sales (fact)</H3>
        <p className="mt-2">
          Discount Amount, Employee Key, Extended Amount, Freight, Sales Amount,
          Order Quantity, Sales Order Number, Order Date Key, Product Key,
          Promotion Key. Many-to-one joins to all five dimensions on the key
          columns.
        </p>
        <H3>Dimensions</H3>
        <ul className="mt-2 space-y-2">
          <li>
            <strong className="text-stone-100">Employee.</strong> Employee Key,
            Base Rate, names (plus a calculated <Code>Full Name</Code>), Sales
            Territory Key, Title
          </li>
          <li>
            <strong className="text-stone-100">Date.</strong> Date Key,
            Calendar Year, Day Number Of Month, Full Date Alternate Key
          </li>
          <li>
            <strong className="text-stone-100">Product.</strong> Model Name,
            List Price, Product Key
          </li>
          <li>
            <strong className="text-stone-100">Promotion.</strong> Promotion
            Key, Promotion Type, Promotion Name
          </li>
          <li>
            <strong className="text-stone-100">Sales Reviews.</strong>{" "}
            EmployeeID, names, JobTitle, Review Overall Score
          </li>
        </ul>

        <H2 id="dax">The DAX measures that mattered</H2>
        <p className="mt-3">
          A star schema means most measures are one line. The relationships do
          the filtering for you.
        </p>

        <H3>Sales basics</H3>
        <CodeBlock label="dax">{`Total Sales = SUM(Sales[Sales Amount])
Total Orders = DISTINCTCOUNT(Sales[Sales Order Number])
Average Order Value = DIVIDE([Total Sales], [Total Orders])`}</CodeBlock>

        <H3>Year-over-year growth</H3>
        <p className="mt-2">
          <Code>SAMEPERIODLASTYEAR</Code> needs a proper Date table with a
          continuous date range marked as the date column. Without that, time
          intelligence measures silently return blank.
        </p>
        <CodeBlock label="dax">{`Sales Previous Year =
    CALCULATE(
        [Total Sales],
        SAMEPERIODLASTYEAR(Date[Full Date Alternate Key])
    )

YoY Growth =
    DIVIDE([Total Sales] - [Sales Previous Year], [Sales Previous Year])`}</CodeBlock>

        <H3>Sales-staff filter</H3>
        <p className="mt-2">
          The employee table includes both sales and non-sales staff. Pages 2
          and 3 only want sales people, so a calculated column flags them based
          on whether they have a Sales Territory.
        </p>
        <CodeBlock label="dax">{`Is Sales Employee =
    IF(NOT(ISBLANK(Employee[Sales Territory Key])), 1, 0)`}</CodeBlock>

        <H2 id="pages">What each page shows</H2>

        <H3>Page 1: Sales Overview</H3>
        <ul className="mt-3 space-y-2">
          <li>KPI cards for Total Sales, Total Orders, Average Order Value, YoY Growth</li>
          <li>Sales-over-time line chart with year and month drilldown</li>
          <li>Sales by region on a map visual</li>
          <li>Top products by revenue</li>
          <li>Slicers: Year, Sales Territory, Product Category</li>
        </ul>

        <H3>Page 2: Sales Details</H3>
        <ul className="mt-3 space-y-2">
          <li>
            Employee performance scorecard, filtered to active sales staff via{" "}
            <Code>Is Sales Employee = 1</Code>
          </li>
          <li>
            Sales by employee with base rate vs earned commission side by side
          </li>
          <li>
            Promotion effectiveness, Sales Amount and Order Quantity by
            Promotion Type
          </li>
          <li>Right-click drill-through into individual employee detail</li>
        </ul>

        <H3>Page 3: Salary Analysis</H3>
        <ul className="mt-3 space-y-2">
          <li>Employee compensation vs review scores</li>
          <li>Sales Reviews integrated via the 1:1 relationship to Employee</li>
          <li>Outliers: highest review scores against lowest base rates</li>
          <li>Salary distribution by Title and Sales Territory</li>
        </ul>

        <H2 id="screenshots">Screenshots</H2>
        <p className="mt-3">
          These images are layout placeholders, not the real report. The report
          itself is a Power BI Project on GitHub (<Code>sales_dashboard.pbip</Code>);
          clone or download it and open it in Power BI Desktop to see the actual
          visuals.
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href="https://github.com/Damatnic/power-bi-sales-dashboard/archive/main.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          >
            Repo ZIP
          </a>
          <span className="text-stone-400">·</span>
          <a
            href="https://github.com/Damatnic/power-bi-sales-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
          >
            Repo (clone with Git)
          </a>
        </p>

        <figure className="mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
          <Image
            src="/projects/power-bi/page-1-sales-overview.png"
            alt="Placeholder wireframe for Sales Overview: header title, row of four empty KPI slots, large panel noting KPI cards, line chart, map, and top products. Open the .pbip in Power BI Desktop for the real visuals."
            width={1600}
            height={900}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-stone-800 bg-stone-900/60 px-4 py-3 text-xs text-stone-300">
            <strong className="text-stone-100">Page 1, Sales Overview.</strong>{" "}
            Placeholder image. Live page has KPI cards on a star-schema fact table. The YoY measure uses{" "}
            <Code>SAMEPERIODLASTYEAR(Date[Full Date Alternate Key])</Code> and
            relies on the Date dimension being marked as the date table. Top
            slicers cascade to every visual on the page.
          </figcaption>
        </figure>

        <figure className="mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
          <Image
            src="/projects/power-bi/page-2-sales-details.png"
            alt="Placeholder wireframe for Sales Details: header, four empty KPI slots, panel labeled employee scorecard, commission, promotions. Open the .pbip in Power BI Desktop for the real visuals."
            width={1600}
            height={900}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-stone-800 bg-stone-900/60 px-4 py-3 text-xs text-stone-300">
            <strong className="text-stone-100">Page 2, Sales Details.</strong>{" "}
            Placeholder image. Live page scorecard filtered to{" "}
            <Code>Is Sales Employee = 1</Code> so admin staff don&apos;t
            distort the comparison. Right-click on a row to drill through into
            an individual employee detail page.
          </figcaption>
        </figure>

        <figure className="mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
          <Image
            src="/projects/power-bi/page-3-salary-analysis.png"
            alt="Placeholder wireframe for Salary Analysis: header, four empty KPI slots, panel labeled compensation vs review score and salary by title. Open the .pbip in Power BI Desktop for the real visuals."
            width={1600}
            height={900}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-stone-800 bg-stone-900/60 px-4 py-3 text-xs text-stone-300">
            <strong className="text-stone-100">Page 3, Salary Analysis.</strong>{" "}
            Placeholder image. Live page: Sales Reviews joined to Employee 1:1. The outliers visual is
            the actual interesting one: highest review scores against lowest
            base rates.
          </figcaption>
        </figure>

        <H2 id="tried-first">What I tried first that didn&apos;t work</H2>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-stone-100">A single flat table.</strong>{" "}
            Easier to load, ran fine on a few measures. As soon as I added{" "}
            <Code>SAMEPERIODLASTYEAR</Code> the values went blank. Time
            intelligence needs a proper Date dimension marked as the date
            table. Rebuilding into a star schema fixed both that and the
            cross-page filter context I&apos;d been fighting.
          </li>
          <li>
            <strong className="text-stone-100">Calculated columns for &quot;previous year sales&quot;.</strong>{" "}
            They worked in row context but blew up the model size and didn&apos;t
            recalc when the slicers changed. Moving the same logic into a
            measure with <Code>CALCULATE</Code> kept the model small and
            actually responded to the page&apos;s filter context.
          </li>
          <li>
            <strong className="text-stone-100">Free-floating slicers per page.</strong>{" "}
            Users (read: me, demoing to the instructor) kept losing their
            place because the Year slicer was in a different corner on every
            page. Locked the slicer panel to the same position on all three
            pages and the navigation immediately got easier to predict.
          </li>
        </ul>

        <H2 id="learnings">What I took from this</H2>
        <ul className="mt-3 space-y-2">
          <li>
            The whole point of a star schema is making DAX measures cheap to
            write. When the relationships are right,{" "}
            <Code>SUM(Sales[Sales Amount])</Code> filtered by any dimension
            column just works.
          </li>
          <li>
            Time intelligence functions need a proper Date table marked as the
            date table, with a continuous date range. Skip that and half your
            time measures silently return blank.
          </li>
          <li>
            Drill-through pages are a much better UX for &quot;show me the details
            on this thing&quot; than trying to cram everything onto one page.
          </li>
          <li>
            Slicer layout matters more than you&apos;d think. Keeping them in
            the same position on every page makes the filter context
            predictable.
          </li>
        </ul>

        <hr className="my-12 border-stone-800/60" />
        <p className="text-sm text-stone-400">
          Built as the final project for WCTC&apos;s Data Visualization course.
          The data is AdventureWorks-style sales records embedded directly in
          the project file, so opening it locally needs no external connections.
        </p>
      </article>
    </main>
  );
}
