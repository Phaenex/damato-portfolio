# damato-portfolio

Personal portfolio (live: [nicholasdamato.vercel.app](https://nicholasdamato.vercel.app)).

Stack, analytics, env vars, and deploy workflow are documented in [`AGENTS.md`](AGENTS.md). For local dev, copy [`env.example`](env.example) to `.env.local` and adjust `NEXT_PUBLIC_SITE_URL` if your dev port is not 3000. With `vercel link`, run `vercel env pull` to merge Vercel **Development** env vars into `.env.local` (review the file afterward).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Ship checks

```bash
npm run build
npx tsc --noEmit
```

Production deploy (from repo root, CLI logged in): `vercel --prod`.
