# Flight Fare Finder

Flight Price Notifier (機票降價通知) — a SaaS landing page + authenticated app shell for a product that watches popular flight routes from Taipei and emails the user when the cheapest fare drops to or below their target price.

## Stack

- Vite + React (static single-page app, built to `dist/`)
- React Router for client-side routing: `/`, `/signin`, `/signup`, `/app` (auth-guarded)
- Supabase Auth (email + password) via `@supabase/supabase-js`
- Tailwind CSS

## Environment variables

The Supabase client (`src/integrations/supabase/client.ts`) reads these at build time:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your project's publishable key (`sb_publishable_…`, replaces the legacy anon key) |

Both are browser-safe (access is gated by Row Level Security). Set them in `.env` for local development, and in your hosting provider's environment settings for deployments.

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # static build to dist/
npm test         # routing tests
```

## Deploying to Vercel

`vercel.json` configures the Vite build and an SPA fallback so deep links like `/app` resolve client-side. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under Project Settings → Environment Variables before deploying.
