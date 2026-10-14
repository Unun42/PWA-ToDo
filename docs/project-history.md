# Project history

How this project went from my first working version to a public repo. Most of
the code changes in this polishing phase were made with Claude Code.

## Where it started

My first version: two separate private repos, `pwa-todo-api` and
`pwa-todo-pwa`. Working, but:

- the deployed API had no access control — anyone who found its URL could read
  and delete every todo
- the READMEs read like a build diary ("Phase 0 scaffold", notes to self)
- errors from add/toggle/delete were silently swallowed in the UI
- a handful of API edge cases returned 500s or HTML instead of JSON errors

## What changed, step by step (11 October 2026)

1. **API hardening.** Malformed or missing JSON bodies return 400 instead of
   500, unknown routes return a JSON 404, todo text is capped at 500 characters
   and request bodies at 10 kB, and the `X-Powered-By` header is gone.
2. **Frontend error handling.** Failed actions show a dismissible error banner,
   typed text survives a failed add, loading failures get a Retry button, and
   checkboxes got proper screen-reader labels.
3. **Simplification pass** (not in the original plan). Swapped two database
   drivers (better-sqlite3 locally, Turso in production) for one libSQL client
   that handles both; replaced `dotenv` and `nodemon` with Node's built-in
   `--env-file` and `--watch`; flattened the frontend's one-file folders; folded
   the reducer into the hook. Goal: fewer layers and dependencies for a beginner
   to read through.
4. **Lists without accounts.** Each list gets a random UUID made by the browser;
   every API query filters on it. Knowing the ID is what gives access, so it
   works like a password, and "Use on another device" shares it as a link. This
   gave both a personal list synced between phone and desktop and a public
   sandbox for demo visitors, from one deployment. Added a 200-todo cap per list
   and rate limiting (60 requests/minute per IP). The old todos weren't worth
   migrating, so the old table was dropped.
5. **Tests and CI.** API: 10 end-to-end tests with Node's built-in test runner
   against an in-memory database. Frontend: 13 Vitest unit tests for the reducer
   and the list-link parser. GitHub Actions runs them on every push.
6. **Monorepo.** Merged both repos into one (`api/` + `web/`) with `git subtree`,
   keeping their history. Render and Netlify were repointed at the new repo and
   the old repos archived.
7. **Presentation.** Rewrote the README for visitors, added a license, replaced
   the placeholder icons with an SVG source and generated PWA/maskable/Apple
   icons, and added a screenshot.

Then the repo went public.

## Gotchas worth remembering

- **vite-plugin-pwa copies function options into the service worker as source
  text.** A function that uses a variable from `vite.config.js` builds fine but
  crashes inside the service worker. Keep those functions self-contained.
- **npm 11.6.2 had a lockfile bug.** It dropped the `@emnapi/*` entries from
  `web/package-lock.json`, and every other npm version then refused it in
  `npm ci`, so CI went red while everything worked locally. Fixed by
  regenerating the lockfile and upgrading Node (24.20.0, with npm 11.19.0) via
  `winget install --id OpenJS.NodeJS.LTS`.
- **winget had Node 24 filed under the Node 22 package**, so a plain
  `winget upgrade` found nothing. Installing the LTS package explicitly fixed
  the tracking; `winget upgrade --id OpenJS.NodeJS.LTS` works from now on.
- **Changing only the `#` part of a URL doesn't reload the page**, so a shared
  list link only takes effect on a real page load.
- **On iPhone, a home-screen app has its own storage, separate from Safari.**
  That's why the app has a paste box for list links instead of relying on
  opening the link.
- **Render's free tier sleeps after 15 minutes idle**; the first request after
  that takes a few seconds.

## Decisions and why

- **Secret-link lists instead of logins**: real accounts would have been the
  biggest part of the codebase for a basic todo app.
- **One database client, Turso-only in production**: a `file:` URL still works
  locally, so cloning the repo needs no accounts.
- **Keep the reducer** (rather than plain `useState`): it's a small, clear
  example of the pattern, and it's what makes the frontend easy to test.
- **Permission checks stay on.** Dropping the production table was blocked by
  Claude Code's safety check; it was done only after an explicit one-time
  approval, and that's the preferred way to handle such actions.
