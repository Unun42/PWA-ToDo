# Todo PWA — frontend

React 19 + Vite + Tailwind CSS v4 + vite-plugin-pwa. See the
[main README](../README.md) for setup and deployment.

## Scripts

| Command           | What it does                                                 |
|-------------------|--------------------------------------------------------------|
| `npm run dev`     | start the dev server on http://localhost:5173                |
| `npm run build`   | build for production into `dist/`                            |
| `npm run preview` | serve the production build locally                           |
| `npm test`        | run the unit tests with Vitest                               |
| `npm run lint`    | check the code with oxlint                                   |

The app talks to `http://localhost:3001` unless `VITE_API_URL` is set (see
`.env.example`). Use a `.env.local` file locally, or an environment variable in
your hosting dashboard for production builds.

## Testing the PWA

The service worker — which makes the app installable and keeps the list readable
offline — only exists in production builds, so test those features with
`npm run build` followed by `npm run preview`, not with `npm run dev`.

## Structure

```
src/
  main.jsx        entry point
  App.jsx         page layout, loading and error states
  api.js          fetch wrapper, one function per API endpoint
  useTodos.js     app state: a reducer plus the add/toggle/delete actions
  listId.js       which list this device uses (from a link, saved, or new)
  components/     TodoForm, TodoItem, TodoList, ListSync (the sharing panel)
public/           icons, generated from favicon.svg
vite.config.js    PWA manifest and offline caching of API responses
```

The icons in `public/` were generated from `public/favicon.svg` with
[@vite-pwa/assets-generator](https://vite-pwa-org.netlify.app/assets-generator/).
