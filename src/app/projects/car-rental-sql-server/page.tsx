import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CopyableQuery } from "@/components/CopyableQuery";
import { JsonLd } from "@/components/JsonLd";
import { projects } from "@/lib/projects";
import { projectJsonLd } from "@/lib/jsonLd";

const project = projects.find((p) => p.slug === "car-rental-sql-server")!;

export const metadata = {
  title: "Car Rental Database | Nicholas D'Amato",
  description:
    "SQL Server schema designed from an ER diagram for a small car rental business. Year-based partitioning, history triggers, and dynamic SQL for portable file paths.",
  alternates: { canonical: "/projects/car-rental-sql-server" },
  openGraph: {
    title: "Car Rental Database | Nicholas D'Amato",
    description:
      "SQL Server schema from an ER diagram: year-based partitioning, audit triggers, and dynamic SQL for portable file paths.",
    type: "article",
    url: "/projects/car-rental-sql-server",
    images: ["/projects/car-rental-sql-server/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Rental Database | Nicholas D'Amato",
    description:
      "SQL Server schema from an ER diagram: year-based partitioning, audit triggers, and dynamic SQL for portable file paths.",
    images: ["/projects/car-rental-sql-server/opengraph-image"],
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

export default function CarRentalCaseStudy() {
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
            Car Rental Database
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone-300">
            SQL Server schema designed from an ER diagram for a small car rental
            business. 11 tables, year-based partitioning on the operational tables,
            full audit history via triggers, and dynamic SQL so the script runs on
            any SQL Server install without manual editing.
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <a
              href="https://github.com/Damatnic/car-rental-sql-server"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded text-[var(--accent)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Source on GitHub
            </a>
            <span className="text-stone-400">·</span>
            <a
              href="https://github.com/Damatnic/car-rental-sql-server/blob/main/car_rental_database.sql"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-stone-300 hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            >
              The full .sql script →
            </a>
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-12 leading-relaxed text-stone-300">
        <H2 id="er-diagram">The ER diagram</H2>
        <p className="mt-3">
          Everything started from this diagram. The web developer building the
          application layer asked for single-column primary keys on the bridge
          tables, so the composite keys you see in the diagram became surrogate
          <Code>IDENTITY</Code> PKs with <Code>UNIQUE</Code> constraints on the
          original composite. Same business rule, different shape.
        </p>
        <figure className="mt-6 overflow-hidden rounded-xl border border-stone-800 bg-stone-950">
          <Image
            src="/projects/car-rental/er_diagram.png"
            alt="Car rental ER diagram showing 11 entities: Customer, Employee, Location, LocationType, VehicleType, Vehicle, Reservation, ReservationVehicleTypes, Rental, RentalVehicles, and Payment."
            width={1600}
            height={900}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full"
            priority={false}
          />
        </figure>

        <H2 id="schema">11 tables, three groups</H2>
        <H3>Lookups</H3>
        <p className="mt-2">
          <Code>LocationType</Code> (Rental Office, Service Center, Storage Lot,
          Airport Counter) and <Code>VehicleTypes</Code> (Compact, Sedan, SUV,
          Truck, Minivan, Luxury). Small and rarely changing.
        </p>
        <H3>Core entities</H3>
        <p className="mt-2">
          <Code>Customers</Code>, <Code>Employees</Code>, <Code>Location</Code>,
          <Code>Vehicles</Code>, and <Code>Payment</Code> (linked to Rentals).
        </p>
        <H3>Operational, partitioned by year</H3>
        <p className="mt-2">
          <Code>Reservation</Code> and <Code>Rentals</Code>. These are the tables
          that grow over time, so they&apos;re the ones that get partitioned.
        </p>
        <H3>Bridge tables with surrogate keys</H3>
        <p className="mt-2">
          <Code>ReservationVehicleTypes</Code> (Reservation × VehicleType with
          Quantity and Notes) and <Code>RentalVehicles</Code> (Rental × Vehicle
          with DailyRentalFee). Each gets a surrogate <Code>IDENTITY</Code> PK
          and a <Code>UNIQUE</Code> constraint on the logical composite.
        </p>

        <H2 id="decisions">Key design decisions</H2>

        <H3>1. Year-based partitioning on the operational tables</H3>
        <p className="mt-2">
          <Code>Reservation</Code> and <Code>Rentals</Code> are partitioned on
          their date columns using a <Code>RANGE RIGHT</Code> partition function
          with boundaries at 2022, 2023, 2024, 2025. Five partitions total:
          pre-2022, 2022, 2023, 2024, 2025-plus. The 2022 partition lives on a
          dedicated <Code>FG_CarRental_2022</Code> filegroup backed by its own
          .ndf data file. Everything else stays on PRIMARY.
        </p>

        <H3>2. Portable file paths via dynamic SQL</H3>
        <p className="mt-2">
          You can&apos;t reference <Code>SERVERPROPERTY()</Code> directly inside an
          <Code>ALTER DATABASE ADD FILE</Code> statement. So the filegroup file
          path is built with <Code>sp_executesql</Code>: pull
          <Code>InstanceDefaultDataPath</Code>, concatenate the filename,
          execute the resulting statement. The script then runs on any SQL
          Server install without me having to hand-edit the path.
        </p>

        <H3>3. Non-clustered PKs on partitioned tables</H3>
        <p className="mt-2">
          SQL Server requires the clustered index on a partitioned table to be
          aligned with the partition column. So <Code>Reservation</Code> and
          <Code>Rentals</Code> use{" "}
          <Code>PRIMARY KEY NONCLUSTERED</Code> on the surrogate ID, plus a
          separate <Code>CLUSTERED INDEX</Code> on{" "}
          <Code>(date_column, id)</Code> aligned with the partition scheme.
          That&apos;s the only way to get both: a meaningful PK and a partition-aligned
          clustered index.
        </p>

        <H3>4. History tables and triggers, not temporal tables</H3>
        <p className="mt-2">
          SQL Server&apos;s system-versioned temporal tables get awkward on
          partitioned base tables. So I went the classic route: a{" "}
          <Code>_History</Code> mirror table per audited entity and an{" "}
          <Code>AFTER INSERT, UPDATE, DELETE</Code> trigger that detects which
          operation is happening by checking which of <Code>inserted</Code> and{" "}
          <Code>deleted</Code> has rows. Six tables get audited: Reservation,
          Rentals, Payment, ReservationVehicleTypes, RentalVehicles, and
          Vehicles.
        </p>

        <H3>5. Filtered and covering indexes for the common queries</H3>
        <p className="mt-2">
          The ones that matter:
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <Code>IX_Rentals_NotReturned</Code> is filtered{" "}
            <Code>WHERE ReturnDate IS NULL</Code>. The &quot;what&apos;s still
            out&quot; query becomes very fast and the index stays small because most rentals
            are already returned.
          </li>
          <li>
            <Code>IX_Customers_LastFirst</Code> covers{" "}
            <Code>(LastName, FirstName)</Code> with{" "}
            <Code>INCLUDE (PhoneNumber, EmailAddress)</Code>. The common
            customer-lookup query doesn&apos;t have to touch the table at all.
          </li>
          <li>
            <Code>IX_Reservation_PickupDate</Code> for date-range filtering on
            the pickup date.
          </li>
          <li>FK indexes on every foreign key so joins land on a seek, not a scan.</li>
        </ul>

        <H2 id="queries">Five queries that justify the schema decisions</H2>
        <p className="mt-3">
          Every design choice above pays off in queries somewhere. These are
          the five I&apos;d hand a reviewer if they wanted to see proof.
        </p>

        <CopyableQuery
          title="What's currently out (filtered index payoff)"
          sql={`SELECT RentalID, CustomerID, PickupDate, ExpectedReturn
FROM Rentals
WHERE ReturnDate IS NULL;`}
          why={`Hits IX_Rentals_NotReturned, the filtered index defined WHERE ReturnDate IS NULL. The index only stores the rows that match, so the seek is cheap and the index footprint stays small even as the table grows.`}
        />

        <CopyableQuery
          title="Customer lookup by name (covering index payoff)"
          sql={`SELECT FirstName, LastName, PhoneNumber, EmailAddress
FROM Customers
WHERE LastName = @LastName AND FirstName = @FirstName;`}
          why={`Every column the query returns is either the key (LastName, FirstName) or INCLUDEd in IX_Customers_LastFirst. SQL Server answers the query from the index alone. No key lookup against the clustered index.`}
        />

        <CopyableQuery
          title="2022 rentals only (partition elimination)"
          sql={`SELECT YEAR(PickupDate) AS yr, COUNT(*) AS rentals
FROM Rentals
WHERE PickupDate >= '2022-01-01'
  AND PickupDate <  '2023-01-01'
GROUP BY YEAR(PickupDate);`}
          why={`The partition function on PickupDate eliminates every partition outside 2022. Only the FG_CarRental_2022 filegroup gets read. The plan output shows "Partition: 2" instead of scanning all five partitions.`}
        />

        <CopyableQuery
          title="Audit trail for one rental (trigger-based history)"
          sql={`SELECT ChangeOperation, ChangeDate, RentalID,
       CustomerID, PickupDate, ReturnDate
FROM Rentals_History
WHERE RentalID = @RentalID
ORDER BY ChangeDate DESC;`}
          why={`Every INSERT, UPDATE, and DELETE on Rentals fires the AFTER trigger and writes a row to Rentals_History with the operation type. Reading the trail back is a normal indexed query against the history table.`}
        />

        <CopyableQuery
          title="Active rentals with customer and vehicle (surrogate-PK payoff)"
          sql={`SELECT r.RentalID, c.LastName, c.FirstName,
       v.Make, v.Model, r.PickupDate
FROM Rentals r
JOIN Customers c          ON c.CustomerID = r.CustomerID
JOIN RentalVehicles rv    ON rv.RentalID  = r.RentalID
JOIN Vehicles v           ON v.VehicleID  = rv.VehicleID
WHERE r.ReturnDate IS NULL;`}
          why={`With surrogate IDENTITY PKs on every table including the bridge, the join chain is one column per ON clause. With the original composite PKs, every join would need two or three columns matched and the query would be twice as long.`}
        />

        <H2 id="verify">How I proved it works</H2>
        <p className="mt-3">
          Three verification queries at the end of the script:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li>
            Filegroup and file layout confirms{" "}
            <Code>FG_CarRental_2022</Code> is attached to{" "}
            <Code>CarRental_2022.ndf</Code>.
          </li>
          <li>
            Row count per partition proves 2021 rows land in partition 1, 2022
            rows in partition 2 on the dedicated filegroup, 2023 in partition
            3, etc.
          </li>
          <li>
            Trigger smoke test: update a Rentals row, then a Payment row, then
            a Vehicle, and query the history tables to show the audit trail
            captured.
          </li>
        </ol>

        <H2 id="tried-first">What I tried first that didn&apos;t work</H2>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-stone-100">Composite primary keys on the bridges.</strong>{" "}
            The ER diagram had them. They&apos;re cleaner. The web dev wanted
            single-column FKs to point at, so the composites became{" "}
            <Code>UNIQUE</Code> constraints and the PKs became surrogate{" "}
            <Code>IDENTITY</Code> columns. Same business rule, easier to join
            against from the app.
          </li>
          <li>
            <strong className="text-stone-100">System-versioned temporal tables for the audit trail.</strong>{" "}
            First attempt. They get awkward as soon as you partition the base
            table, because the history table has to follow its own clustering
            rules. Swapped to the classic{" "}
            <Code>_History</Code> mirror + AFTER trigger pattern. More code,
            but it composes with partitioning cleanly.
          </li>
          <li>
            <strong className="text-stone-100">Hard-coded file paths in the filegroup setup.</strong>{" "}
            Worked on my machine. Broke the second I tried to run the script
            on the school&apos;s SQL Server install where the data directory
            lives somewhere else. Dynamic SQL pulling{" "}
            <Code>InstanceDefaultDataPath</Code> via{" "}
            <Code>sp_executesql</Code> made it portable.
          </li>
        </ul>

        <H2 id="learnings">What I took from this</H2>
        <ul className="mt-3 space-y-2">
          <li>
            Partition functions and schemes have to exist before the tables
            that use them. So filegroup setup is literally the first thing in
            the script.
          </li>
          <li>
            <Code>sp_executesql</Code> with a parameterized string is the
            cleanest way to feed a portable file path into{" "}
            <Code>ALTER DATABASE ADD FILE</Code>. Direct{" "}
            <Code>SERVERPROPERTY()</Code> doesn&apos;t work there.
          </li>
          <li>
            For combined INSERT/UPDATE/DELETE triggers, the operation type
            comes from checking which of <Code>inserted</Code> and{" "}
            <Code>deleted</Code> has rows. INSERT: <Code>inserted</Code> only.
            DELETE: <Code>deleted</Code> only. UPDATE: both.
          </li>
          <li>
            Filtered indexes are the right tool for &quot;where this column is
            null&quot; and &quot;where status = active&quot; queries. The index stays small and the
            matching rows are essentially free.
          </li>
        </ul>

        <hr className="my-12 border-stone-800/60" />
        <p className="text-sm text-stone-400">
          Built as the Unit 3 project for WCTC&apos;s Advanced SQL course. The full
          .sql script (about 1,000 lines) runs end to end, including sample data
          spread across 2021 through 2025 so every partition has rows.
        </p>
      </article>
    </main>
  );
}
