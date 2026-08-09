# Todo API — Phase 1

Express + better-sqlite3, verified end-to-end (CRUD, validation, 404s, CORS).

## Getting started

    npm install
    cp .env.example .env
    npm run dev

Server runs at http://localhost:3001. The SQLite file is created automatically at
`./data/todos.db` on first run (both the file and its parent directory).

## Routes

| Method | Path         | Body               | Notes                          |
|--------|--------------|--------------------|----------------------------------|
| GET    | /todos       | —                  | all todos, newest first        |
| POST   | /todos       | `{ "text": "..." }`| 400 if text is empty/whitespace |
| PATCH  | /todos/:id   | —                  | toggles `completed`, 404 if missing |
| DELETE | /todos/:id   | —                  | 204 on success, 404 if missing  |
| GET    | /health      | —                  | liveness check                 |

## Structure

    src/
      db/
        sqliteDriver.js  — local dev: better-sqlite3 against a file, WAL mode
        tursoDriver.js   — production: libSQL client, same interface
        index.js         — picks a driver based on whether TURSO_DATABASE_URL is set
      routes/
        todos.js         — the four CRUD routes, driver-agnostic (always awaits)
      server.js          — Express app, CORS, JSON error handler, mounts the router

Both drivers expose the same five methods (`getAll`, `getById`, `insert`,
`toggleCompleted`, `remove`), so `routes/todos.js` never needs to know or care which
one is active.

## Deploy

The two apps have a bootstrapping problem: the backend's `CORS_ORIGIN` needs the
frontend's URL, and the frontend's `VITE_API_URL` needs the backend's URL. Break the
cycle by deploying backend first with a placeholder, then circling back.

**1. Turso (database)**

    curl -sSfL https://get.turso.tech/install.sh | bash
    turso auth login
    turso db create todo-db
    turso db show todo-db --url          # → TURSO_DATABASE_URL
    turso db tokens create todo-db       # → TURSO_AUTH_TOKEN

**2. Backend → Render**

- Push `todo-api` to a GitHub repo
- Render dashboard → New → Blueprint → point at the repo (picks up `render.yaml`)
- When prompted, set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` from step 1, and
  `CORS_ORIGIN` to a placeholder for now (`http://localhost:5173` is fine)
- Deploy, note the resulting URL (`https://todo-api-xxxx.onrender.com`)

Render's free tier spins the service down after 15 minutes idle — the first request
after a gap takes a few extra seconds to wake it up. Expected, not a bug.

**3. Frontend → Vercel or Netlify**

- Push `todo-pwa` to a GitHub repo
- Import the repo, framework auto-detected as Vite
- Set the `VITE_API_URL` environment variable to the Render URL from step 2
- Deploy, note the resulting URL (`https://your-app.vercel.app`)

**4. Close the loop**

- Back in Render's dashboard, update `CORS_ORIGIN` to the real frontend URL from
  step 3 and let it restart (env var changes on Render just restart the service,
  no rebuild needed)

**5. Verify**

    curl https://todo-api-xxxx.onrender.com/health

Then open the Vercel/Netlify URL in Safari on the iPhone X, confirm todos load, add
one, and only then Add to Home Screen — easier to debug CORS/env issues in the
browser's dev tools than after it's an installed app.

