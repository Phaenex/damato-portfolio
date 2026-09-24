export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  tech: string[];
  github: string;
  demoUrl?: string;
  demoLabel?: string;
};

export type SideProject = {
  slug: string;
  title: string;
  description: string;
  tech: string[];
  github: string;
  liveUrl: string;
};

export const sideProjects: SideProject[] = [
  {
    slug: "python-mastery",
    title: "python-mastery",
    description:
      "Couldn't find a Python lessons site that ran real code against real data and tracked what I'd forgotten. Built one. 61 lessons across 11 modules, Pyodide in a Web Worker (real infinite-loop kill), pandas + numpy preloaded, a real spaced-repetition queue that resurfaces lessons as they come due. Runs entirely in the browser, no signup.",
    tech: ["Next.js", "TypeScript", "Pyodide (Worker)", "Tailwind"],
    github: "https://github.com/Phaenex/python-mastery",
    liveUrl: "https://damato-python.vercel.app",
  },
  {
    slug: "sql-mastery",
    title: "sql-mastery",
    description:
      "Same thing for SQL, built the semester I was taking Advanced SQL at WCTC. 55 lessons across 11 modules, real SQLite via sql.js, an AI tutor prompted to ask before answering, a /stats view with rank ladder and review queue. The playground hits the same engine the lessons use. Type `help` in the shell on the homepage.",
    tech: ["Next.js", "TypeScript", "SQL.js", "OpenAI", "Tailwind"],
    github: "https://github.com/Phaenex/sql-mastery",
    liveUrl: "https://damato-sql.vercel.app",
  },
];

export const projects: Project[] = [
  {
    slug: "olympic-medal-etl",
    title: "Olympic Medal Pipeline",
    tagline: "Python ETL, web pages into SQL Server, out to Excel",
    description:
      "Scrapes the Tokyo 2020 and Beijing 2022 medal pages from Olympedia, enriches the records with continent and capital data from SQL Server, exports a multi-tab Excel workbook with pivot summaries.",
    bullets: [
      "Hand-parsed the medal table with BeautifulSoup after pandas.read_html choked on embedded flag image tags",
      "Enriched 1,343 medal records with continent and capital from a SQL Server World database via pymssql, left-joined to deal with IOC vs ISO country code mismatches",
      "Wrote a two-tab Excel workbook with openpyxl plus four pivot summaries (continent and country, by Olympics, by medal type, top five countries)",
    ],
    tech: [
      "Python",
      "BeautifulSoup",
      "pandas",
      "pymssql",
      "openpyxl",
      "ETL",
      "SQL Server",
    ],
    github: "https://github.com/Phaenex/olympic-medal-etl",
    demoUrl: "/projects/olympic-medals",
    demoLabel: "Try the dashboard",
  },
  {
    slug: "car-rental-sql-server",
    title: "Car Rental Database",
    tagline: "SQL Server schema with partitioning and audit triggers",
    description:
      "An 11-table SQL Server database built from an ER diagram for a small car rental business. Year-based table partitioning, history triggers for audit trails, and dynamic SQL so the script runs on any SQL Server install without editing.",
    bullets: [
      "Swapped the ER diagram's composite PKs on the bridge tables for single-column surrogates with UNIQUE constraints on the original composite, after the app dev asked for simpler key access patterns",
      "Year-based partitioning on Rentals and Reservation, with the 2022 partition living on its own filegroup and data file (path auto-detected via SERVERPROPERTY so the script ports across installs)",
      "AFTER INSERT/UPDATE/DELETE history triggers across six tables for a full audit trail, plus filtered indexes for the common 'still out' and customer-lookup queries",
    ],
    tech: [
      "T-SQL",
      "SQL Server",
      "ER Modeling",
      "Partitioning",
      "Triggers",
    ],
    github: "https://github.com/Phaenex/car-rental-sql-server",
    demoUrl: "/projects/car-rental-sql-server",
    demoLabel: "Read the case study",
  },
  {
    slug: "power-bi-sales-dashboard",
    title: "Power BI Sales Dashboard",
    tagline: "Three-page dashboard on a star schema",
    description:
      "Built on a star schema (Sales fact plus Employee, Date, Product, Promotion, Sales Reviews dimensions). DAX measures for KPIs, slicer-driven filters, drill-through pages. Sales overview, employee performance, and salary-vs-review breakdown.",
    bullets: [
      "KPI cards, year-over-year growth, sales by region, top products by revenue",
      "Employee scorecard with drill-through, plus promotion effectiveness by Sales Amount and Order Quantity",
      "Salary versus review-score analysis using a 1:1 relationship between Sales Reviews and Employee",
    ],
    tech: ["Power BI", "DAX", "Star Schema"],
    github: "https://github.com/Phaenex/power-bi-sales-dashboard",
    demoUrl: "/projects/power-bi-sales-dashboard",
    demoLabel: "Read the case study",
  },
];
