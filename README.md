# Todo PWA

A small todo app I made to learn how a Progressive Web App, a REST API and free
hosting fit together. I use it daily on my phone and computer, and I'm slowly
shaping it into something I'm happy with.

**[Try the demo →](https://unun-pwa.netlify.app/)** You'll get your own empty
list, so click around as much as you like. (The backend sleeps when nobody's
using it, so the first load can take a few seconds.)

<img src="docs/screenshot.png" alt="The app showing a list of six todos, two of them completed" width="400">

## What it does

- Add, tick off and delete todos. That's the whole feature list.
- Install it to your home screen or desktop like a regular app.
- Your last-loaded list stays readable offline.
- Use the same list on several devices without making an account (see below).

## How lists work without accounts

The first time you open the app, it makes up a long random ID for your list and
saves it in the browser. Every request to the API includes that ID, and the API
only returns todos with a matching ID. Nobody can guess the ID, so it works like
a password: "Use on another device" in the app gives you a link containing it,
and anyone with that link can use the list.

That also means every demo visitor gets their own private list.

## What it's made of

- **Frontend** (`web/`): React, Vite, Tailwind CSS and vite-plugin-pwa, hosted on Netlify
- **Backend** (`api/`): Node.js and Express, hosted on Render
- **Database**: SQLite through [Turso](https://turso.tech)
- **Tests**: Vitest and Node's built-in test runner, run by GitHub Actions on every push

Everything runs on free tiers.

## Running it yourself

You need [Node.js](https://nodejs.org) 24 (22.12+ also works). No accounts
needed: locally the API keeps todos in a SQLite file.

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

`npm test` runs the tests in either folder. The READMEs in [`api/`](api/README.md)
and [`web/`](web/README.md) have more detail on each half.

<details>
<summary>Deploying your own copy</summary>

1. Create a database on [Turso](https://turso.tech) and note its URL and auth
   token (`turso db show <name> --url`, `turso db tokens create <name>`).
2. On [Render](https://render.com), create a **Blueprint** from this repo; it
   reads `render.yaml`. Fill in `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, and
   set `CORS_ORIGIN` to `http://localhost:5173` for now.
3. On Netlify or Vercel, import the repo with `web` as the base/root directory,
   and set `VITE_API_URL` to your Render URL.
4. Back on Render, change `CORS_ORIGIN` to your Netlify/Vercel URL.

</details>

## How this was made

I built the first version, then polished it with help from Claude Code: error
handling, list sharing, tests, CI and these docs. The longer story, with the
decisions and gotchas along the way, is in
[`docs/project-history.md`](docs/project-history.md).

## License

[MIT](LICENSE): use anything here however you like.
