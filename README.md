# rts-labs-coding-challenge

This repository is a small full-stack demo: a Vite-powered React frontend co-located with a lightweight Express backend.
## Overview
- Frontend: React (ESM) app built with Vite. Entry: `src/main.jsx`, which configures client-side routes via `react-router`: `/` (`App`), `/login` (`LoginPage`), `/quote-stock` (`QuoteStock`), and `/about` (a test route).
- Pages live under `src/pages/`: `LoginPage.jsx` (tabbed Sign In / Sign Up form) and `QuoteStock.jsx` (stock ticker lookup + logout), sharing a common purple/blue gradient card theme defined in their respective `.css` files.
- Backend: embedded Express app in `server.js` served alongside Vite via `vite-express`. Dev entrypoint is `server.js` (the `dev` script runs it directly).
- Data: a local SQLite database file `users.db` lives in the repo root and is initialized by `server.js`.

## Developer quick start
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
- Start the production server:

```bash
npm start
```
### Scripts (from `package.json`)
- `npm run dev` — starts `node server.js`, which launches ViteExpress on port `3000` (or `process.env.PORT`).
- `npm run start` — runs `node server.js`. Production behavior (serving `dist/`, catch-all routing) is controlled by the `NODE_ENV=production` environment variable being set externally (e.g., by Render), not by the script itself.
- `npm run test` — runs Vitest for unit tests in `tests/`.
- `npm run build` — runs `vite build`.
- `npm run preview` — runs `vite preview`.
- `npm run lint` — runs `oxlint`.

### Testing and mocking
- Test runner: Vitest (`tests/` directory): `tests/server.test.js`, `tests/setup.js`, `tests/context/AuthContext.spec.jsx`, `tests/pages/LoginPage.spec.jsx`, `tests/pages/QuoteStock.spec.jsx`.
- React tests use `@testing-library/react` and `@testing-library/user-event`. Common patterns: mocking `fetch` with `vi.fn()`/`vi.mockResolvedValueOnce()`, mocking `react-router` to stub `useNavigate`, and (in `QuoteStock.spec.jsx`) mocking the `finnhub` module to stub the quote API.
- Components that rely on context or routing are rendered with wrappers in tests (e.g., `BrowserRouter` and `AuthProvider` from `src/context/AuthContext.jsx`).
- Tests query by accessible role/label/placeholder/alt text rather than CSS classes, so page restyles should preserve that user-facing text.

### Backend notes
- `server.js` initializes a SQLite database (`users.db`, table `users`) and exposes auth routes under `/api/*`: `POST /api/signup`, `POST /api/login`, `POST /api/logout`.
- Two diagnostic routes are not under `/api`: `GET /db/users` (reports whether the DB connection is open) and `GET /hello` (health check).
- The frontend `AuthContext` expects authentication endpoints at `/api/login`, `/api/signup`, and `/api/logout` (tests mock these calls; the server implements all three).

### Conventions and tips for contributors
- Code is ESM-based (`type: "module"` in `package.json`); use `import`/`export` syntax.
- Assets are imported via relative paths inside components (e.g., `import heroImg from './assets/hero.png'`).
- Keep UI state local to components unless adding a deliberate cross-component store.
- If adding backend routes or new packages, update `package.json` and keep `npm run dev` semantics intact.

### Deployment (Production)

- **Live**: https://rts-labs-coding-challenge.onrender.com (automatic deployments via Render).
- In production mode (`NODE_ENV=production`), the app:
  - Serves static assets from `dist/` (built by `npm run build`).
  - Uses a catch-all route to support client-side routing (React Router).
  - Listens on the port specified by `PORT` environment variable (Render sets this automatically).
- Build and deployment: Render automatically runs `npm install`, `npm run build`, and then `npm start` on new commits.

Where to look first
- Frontend entry: `src/main.jsx` and `src/App.jsx`.
- Auth flow: `src/context/AuthContext.jsx` and `src/pages/LoginPage.jsx`.
- Stock lookup page: `src/pages/QuoteStock.jsx` (formerly `StockLookupPage`; watch for stale references to the old name).
- Backend entry and DB init: `server.js` (includes production asset serving and environment checks).
- Tests: `tests/` (see `tests/pages/LoginPage.spec.jsx` and `tests/pages/QuoteStock.spec.jsx` for examples of mocks and render wrappers).
