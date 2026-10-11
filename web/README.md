# Todo PWA

React 19 + Vite + Tailwind v4 + vite-plugin-pwa. Installable, and the last-loaded
list stays readable offline. Requires Node 22.12+.

Each device starts with its own list. To use the same list on another device,
open "Use on another device" at the bottom of the app and either open the link
there or paste it into the box on the other device. Anyone with the link can edit
the list — there are no accounts.

## Getting started

Start the API first (see `../api`), then:

    npm install
    npm run dev

The app talks to `http://localhost:3001` by default. To point it elsewhere, set
`VITE_API_URL` (see `.env.example`) — in a `.env.local` file locally, or as an
environment variable in your hosting dashboard for production builds.

## Tests

    npm test

Runs the unit tests (`*.test.js` next to the code they test) with Vitest.
GitHub Actions runs lint, tests and a production build on every push.

## Testing the PWA

    npm run build
    npm run preview

The service worker isn't registered by `npm run dev`, so always test install and
offline behavior against the built output.

## Structure

    src/
      api.js         — fetch wrapper, one function per API endpoint
      listId.js      — which list this device uses (from a link, saved, or new)
      useTodos.js    — state: a reducer plus the add/toggle/delete actions
      components/    — TodoForm, TodoItem, TodoList, ListSync (sharing panel)
      App.jsx        — page layout, loading and error states
    vite.config.js   — PWA manifest and offline caching of API responses

## Deploy

Deploy the backend (`../api`) first — see its README for the Turso + Render steps.
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
