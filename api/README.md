# Todo API

The REST API for the Todo PWA: Express 5 with a [Turso](https://turso.tech)
(libSQL) database. See the [main README](../README.md) for setup and deployment.

## Scripts

| Command       | What it does                                       |
|---------------|----------------------------------------------------|
| `npm run dev` | start on http://localhost:3001, restart on changes |
| `npm start`   | start without watching (used by Render)            |
| `npm test`    | run the tests against an in-memory database        |

Settings come from `.env` (copy `.env.example`). By default it uses a local SQLite
file, `todos.db`; point `TURSO_DATABASE_URL` at Turso to use a hosted database.
The `todos` table is created automatically on first start.

## Routes

Every todo belongs to a list. A list is identified by a UUID that the frontend
generates, and there's no separate "create list" step — a list exists once it has
a todo. `:listId` must be a UUID, otherwise the API responds with 400.

| Method | Path                       | Body                 | Response                                  |
|--------|----------------------------|----------------------|-------------------------------------------|
| GET    | /lists/:listId/todos       | —                    | the list's todos, newest first            |
| POST   | /lists/:listId/todos       | `{ "text": "..." }`  | 201 with the new todo                     |
| PATCH  | /lists/:listId/todos/:id   | —                    | the todo with `completed` flipped         |
| DELETE | /lists/:listId/todos/:id   | —                    | 204                                       |
| GET    | /health                    | —                    | `{ "status": "ok" }`                      |

Errors are always JSON, like `{ "error": "todo not found" }`:

- **400**: invalid list ID, text that's missing, empty or over 500 characters,
  invalid JSON, or a list that already has 200 todos
- **404**: no todo with that ID in that list, or an unknown route
- **429**: more than 60 requests per minute from one IP address

A todo looks like this (`completed` is `0` or `1`, since SQLite has no booleans):

```json
{
  "id": 1,
  "list_id": "048ee36f-406e-4feb-8fee-b7d82d4425e9",
  "text": "Buy oat milk",
  "completed": 0,
  "created_at": "2026-10-11 16:39:27"
}
```

## Structure

```
src/
  db.js            Turso/libSQL client and the todo queries
  routes/todos.js  the routes, list ID check and input validation
  app.js           Express app: CORS, rate limit, JSON 404 and error handlers
  server.js        starts the app on PORT
test/
  todos.test.js    end-to-end tests of every route
```
