# damato-portfolio

Personal portfolio (live: [nicholasdamato.vercel.app](https://nicholasdamato.vercel.app)).

Stack, analytics, env vars, and deploy workflow are documented in [`AGENTS.md`](AGENTS.md). For local dev, copy [`env.example`](env.example) to `.env.local` and adjust `NEXT_PUBLIC_SITE_URL` if your dev port is not 3000. With `vercel link`, run `vercel env pull` to merge Vercel **Development** env vars into `.env.local` (review the file afterward).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Assets

Required static files are checked by `npm run validate:assets` (runs automatically on `dev` and `build`):

| Path | Rule |
|------|------|
| `public/headshot_1000.jpg` | exists, ≥ 500×500 px |
| `public/DAmato_Resume_DataAnalyst.pdf` | exists, > 10 KB |
| `public/olympic-medals.json` | 1,343 records |
| `public/projects/car-rental/er_diagram.png` | exists |
| `public/projects/power-bi/page-{1,2,3}-*.png` | all three exist, each > 5 KB |

**Power BI screenshot regen:** export each page from Power BI Desktop (1920×1080) → drop PNGs in `public/projects/power-bi/` as `page-1-sales-overview.png`, `page-2-sales-details.png`, `page-3-salary-analysis.png` → `npm run validate:assets` → deploy.

## Ship checks

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

For E2E admin auth tests, set `ANALYTICS_SECRET` in `.env.local` (or export it in CI). Full local env with KV:

```bash
vercel link
vercel env pull .env.local
vercel env pull .env.production.pulled --environment=production
node scripts/merge-local-env.mjs
npm run test:e2e
```

Or inline for a one-off run:

```bash
ANALYTICS_SECRET=your-secret npm run test:e2e
```

Production deploy (from repo root, CLI logged in): `vercel --prod`.
