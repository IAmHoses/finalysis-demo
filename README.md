# rts-labs-coding-challenge

This repository is a small full-stack demo: a Vite-powered React frontend co-located with a lightweight Express backend.

Overview
- Frontend: React (ESM) app built with Vite. Entry: `src/main.jsx`. Root UI: `src/App.jsx` and pages under `src/pages/` (example: `LoginPage.jsx`).
- Backend: embedded Express app in `server.js` served alongside Vite via `vite-express`. Dev entrypoint is `server.js` (the `dev` script runs it directly).
- Data: a local SQLite database file `users.db` lives in the repo root and is initialized by `server.js`.

Developer quick start
- Install dependencies:

```bash
npm install
```

- Run the app in development (dev server + embedded backend on port 3000):

```bash
npm run dev
```

- Build production assets:

```bash
npm run build
```

- Preview built assets locally:

```bash
npm run preview
```

- Run tests:

```bash
npm run test
```

- Run lint:

```bash
npm run lint
```

Scripts (from `package.json`)
- `npm run dev` — starts `node server.js`, which launches ViteExpress on port `3000`.
- `npm run start` — runs `NODE_ENV=production node server.js`.
- `npm run test` — runs Vitest for unit tests in `tests/`.
- `npm run build` — runs `vite build`.
- `npm run preview` — runs `vite preview`.
- `npm run lint` — runs `oxlint`.

Testing and mocking
- Test runner: Vitest (`tests/` directory). Example tests: `tests/sum.test.js`, `tests/pages/LoginPage.spec.jsx`.
- React tests use `@testing-library/react` and `@testing-library/user-event`. Common patterns: mocking `fetch` with `vi.fn()`/`vi.mockResolvedValueOnce()`, and mocking `react-router` to stub `useNavigate`.
- Components that rely on context or routing are rendered with wrappers in tests (e.g., `BrowserRouter` and `AuthProvider` from `src/context/AuthContext.jsx`).

Backend notes
- `server.js` initializes a SQLite database (`users.db`) and exposes simple API routes under `/api/*` (examples: `/api/users`, `/api/hello`).
- The frontend `AuthContext` expects authentication endpoints at `/api/login`, `/api/signup`, and `/api/logout` (tests mock these calls; the server may require corresponding routes to be implemented).

Conventions and tips for contributors
- Code is ESM-based (`type: "module"` in `package.json`); use `import`/`export` syntax.
- Assets are imported via relative paths inside components (e.g., `import heroImg from './assets/hero.png'`).
- Keep UI state local to components unless adding a deliberate cross-component store.
- If adding backend routes or new packages, update `package.json` and keep `npm run dev` semantics intact.

Where to look first
- Frontend entry: `src/main.jsx` and `src/App.jsx`.
- Auth flow: `src/context/AuthContext.jsx` and `src/pages/LoginPage.jsx`.
- Backend entry and DB init: `server.js`.
- Tests: `tests/` (see `tests/pages/LoginPage.spec.jsx` for examples of mocks and render wrappers).
