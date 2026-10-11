# Todo PWA

A small, installable todo app that syncs between your devices without needing an
account. It's built entirely on free tools and free hosting tiers, and is meant to
be easy to read and learn from.

**[Try the live demo →](https://unun-pwa.netlify.app/)** You'll get your own empty
list, so feel free to play around.

<img src="docs/screenshot.png" alt="The app showing a list of six todos, two of them completed" width="400">

## Features

- **Installable** — add it to your phone's home screen or your desktop like a
  native app (it's a Progressive Web App).
- **Works offline (read-only)** — the last-loaded list stays visible without a
  connection.
- **Syncs between devices, no sign-up** — each list has a secret link. Open the
  link on another device and you're looking at the same list.
- **Private by default** — every visitor gets their own fresh list, so the live
  demo doubles as a sandbox.

## Tech stack

| Part      | Built with                                                       | Hosted on (free tier)    |
|-----------|------------------------------------------------------------------|--------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, vite-plugin-pwa                 | Vercel or Netlify        |
| Backend   | Node.js, Express 5                                               | Render                   |
| Database  | SQLite via [Turso](https://turso.tech) (libSQL)                  | Turso                    |
| Tests, CI | Vitest, Node's built-in test runner, GitHub Actions              | GitHub                   |

## How it works

```
 Browser / installed app                 Render                     Turso
┌───────────────────────┐   fetch   ┌────────────────┐   SQL   ┌──────────────┐
│ web/  React PWA       │ ────────▶ │ api/  Express  │ ──────▶ │ todos table  │
│ service worker caches │ ◀──────── │ REST API       │ ◀────── │              │
│ the last list offline │   JSON    └────────────────┘         └──────────────┘
└───────────────────────┘
```

**Lists without accounts.** The first time the app opens, it makes up a random ID
(a UUID) for a new list and remembers it in the browser. Every request includes
that ID — `GET /lists/<id>/todos` — and the API only ever returns todos with a
matching ID. The ID is long and random enough that it can't be guessed, so it
works like a password: anyone who has it can use the list, and nobody else can.
"Use on another device" in the app shows a link containing the ID.

## Project structure

```
api/                   Express REST API — see api/README.md
  src/db.js            database connection and queries
  src/routes/todos.js  the routes and input validation
  src/app.js           the Express app (CORS, rate limit, error handling)
  test/                end-to-end tests of every route
web/                   React PWA — see web/README.md
  src/api.js           talks to the API
  src/useTodos.js      app state (a reducer) and actions
  src/listId.js        which list this device uses
  src/components/      the UI
render.yaml            Render deploy config for the API
```

## Run it locally

You need [Node.js](https://nodejs.org) 22 or newer. No accounts are needed —
locally the API stores todos in a SQLite file.

```bash
# Terminal 1: the API, on http://localhost:3001
cd api
npm install
cp .env.example .env
npm run dev
```

```bash
# Terminal 2: the app, on http://localhost:5173
cd web
npm install
npm run dev
```

Run the tests with `npm test` in either folder. GitHub Actions runs them, plus
lint and a production build, on every push.

## Deploy your own

Deploy the backend first — the frontend needs its URL.

**1. Database (Turso).** Install the [Turso CLI](https://docs.turso.tech/cli/installation), then:

```bash
turso auth login
turso db create todo-db
turso db show todo-db --url      # → TURSO_DATABASE_URL
turso db tokens create todo-db   # → TURSO_AUTH_TOKEN
```

**2. Backend (Render).** Push this repo to GitHub, then in Render choose
**New → Blueprint** and pick the repo; it reads `render.yaml`. Fill in
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from step 1, and set `CORS_ORIGIN` to
`http://localhost:5173` for now. Note the service's URL.

> Render's free tier sleeps after 15 minutes without traffic, so the first request
> after a break takes a few seconds longer.

**3. Frontend (Vercel or Netlify).** Import the repo, set the **Root Directory**
(Netlify: **Base directory**) to `web`, and add an environment variable
`VITE_API_URL` with the Render URL from step 2. Note the site's URL.

**4. Connect them.** In Render, change `CORS_ORIGIN` to the site's URL from step 3.

## License

[MIT](LICENSE)
