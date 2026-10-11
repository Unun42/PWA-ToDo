# Todo API

Express 5 + [Turso](https://turso.tech) (libSQL). Requires Node 22+.

## Getting started

    npm install
    cp .env.example .env     # then fill in your Turso URL and token
    npm run dev

Server runs at http://localhost:3001 and creates the `todos` table on first start.
No Turso account? Set `TURSO_DATABASE_URL=file:todos.db` in `.env` to use a local
SQLite file instead.

## Routes

| Method | Path         | Body               | Notes                                  |
|--------|--------------|--------------------|----------------------------------------|
| GET    | /todos       | —                  | all todos, newest first                |
| POST   | /todos       | `{ "text": "..." }`| 400 if text is empty or over 500 chars |
| PATCH  | /todos/:id   | —                  | toggles `completed`, 404 if missing    |
| DELETE | /todos/:id   | —                  | 204 on success, 404 if missing         |
| GET    | /health      | —                  | liveness check                         |

Errors are always JSON: `{ "error": "..." }`.

## Structure

    src/
      db.js            — Turso/libSQL client and the four todo queries
      routes/todos.js  — the CRUD routes and input validation
      server.js        — Express app, CORS, JSON 404 and error handlers

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

