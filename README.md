# Todo PWA — Phase 0 scaffold

Vite + React + Tailwind v4 + vite-plugin-pwa, verified to build cleanly.

## Getting started

    npm install
    npm run dev

Open the printed localhost URL. You should see "Todo scaffold is running" on a dark background.

## Verify the PWA build

    npm run build
    npm run preview

`npm run dev` does not reliably register the service worker — always test PWA behavior
against the built output (`build` + `preview`), not the dev server.

## What's already wired up

- Tailwind v4 via the official `@tailwindcss/vite` plugin (no `tailwind.config.js` needed
  for basic usage in v4 — see `src/index.css`)
- `vite-plugin-pwa` generating the manifest and service worker on build
- Placeholder icons at `public/icon-192.png`, `public/icon-512.png`,
  `public/apple-touch-icon.png` — swap these for real artwork whenever you get to the
  design pass
- iOS-specific meta tags in `index.html` (Safari mostly ignores `manifest.json`, so these
  matter separately)
- A `NetworkFirst` runtime caching rule pre-configured in `vite.config.js` for any request
  under `/api` — ready for Phase 1 once the Express backend exists

## Phase 2: wired to the backend

- `src/api/todos.js` — thin fetch wrapper, one function per endpoint
- `src/reducers/todosReducer.js` — pure reducer, no React/fetch dependency, unit-testable
  on its own (see the assertions run during development)
- `src/hooks/useTodos.js` — `useReducer` + the API client, exposes `todos`, `status`,
  `error`, `addTodo`, `toggleTodo`, `deleteTodo`
- `src/components/` — `TodoForm`, `TodoItem`, `TodoList`, kept plain/functional on
  purpose; the real visual design pass comes later

Run both projects side by side for local dev:

    # terminal 1
    cd todo-api && npm run dev

    # terminal 2
    cd todo-pwa && npm run dev

### Bug caught and fixed while wiring this up

The original `vite.config.js` runtime-caching rule used a function to match API
requests, closing over an `apiOrigin` variable. That builds fine, but
`vite-plugin-pwa` serializes function matchers via `.toString()` for the generated
service worker — which captures the function's source text only, not the variables it
closed over. The compiled `sw.js` would have thrown `apiOrigin is not defined` the
first time it ran. Fixed by building the pattern as a `RegExp` instead, which
serializes by value. Worth remembering any time a `vite-plugin-pwa` config option takes
a function: assume only literal, closure-free logic survives into the built worker.

### `VITE_API_URL` in production

`VITE_API_URL` is only auto-loaded from `.env.development` in dev mode. For the
production build, set it as an environment variable in Vercel/Netlify's dashboard
(project settings → Environment Variables) — Vite's `loadEnv` picks up real
environment variables at build time, not just `.env` files, so no committed
`.env.production` is needed. Without it, `src/api/todos.js` falls back to
`http://localhost:3001`, which won't exist once deployed.

## Deploy

Deploy the backend (`todo-api`) first — see its README for the Turso + Render steps.
You'll need its URL here.

1. Push this repo to GitHub
2. Vercel or Netlify → import the repo (Vite is auto-detected, no config needed)
3. Set the `VITE_API_URL` environment variable to the deployed Render URL
4. Deploy, note the resulting URL
5. Go back to the backend's Render dashboard and set `CORS_ORIGIN` to this URL

Then on the iPhone X: open the deployed URL in Safari, confirm todos actually load
and round-trip (add one, refresh, it should still be there) before installing —
Safari's dev tools aren't available on-device, so catch connectivity issues in a
regular browser first. Once confirmed: Share → Add to Home Screen.

## Next: Phase 5

Full offline verification — kill wifi, confirm the app shell still loads; force-quit
and reopen from the home screen icon to confirm state persists.
