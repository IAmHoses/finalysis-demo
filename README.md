# RTS Labs Coding Challenge

A small full-stack demo app: a React (Vite) frontend with a lightweight Express backend, all running out of a single Node process. It features email/password sign-up & login (backed by SQLite) and a simple stock ticker lookup powered by the Finnhub API.

**Live demo:** https://rts-labs-coding-challenge.onrender.com

AI Assistant context is located in `.github/copilot-instructions.md` if you would like to feed it to your model.

## ✨ Features

- **Sign In / Sign Up** — a tabbed auth form (`LoginPage`) with password hashing via `bcrypt` and a local SQLite user store.
- **Stock Quote Lookup** — search a ticker symbol and see its opening price (`QuoteStock`), styled to match the login page's card/gradient theme.
- **Client-side routing** via `react-router`, with an embedded Express server that also serves the API and, in production, the built frontend.

## 🗂️ Project structure

```
server.js            # Express app: auth API, SQLite setup, serves the built frontend in production
src/
  main.jsx           # App entry point + route definitions
  App.jsx             # Landing page ("/")
  context/
    AuthContext.jsx   # login/signup/logout logic, calls the backend API
  pages/
    LoginPage.jsx      # Sign In / Sign Up form ("/login")
    QuoteStock.jsx      # Stock ticker lookup ("/quote-stock")
tests/                # Vitest unit tests (see "Testing" below)
users.db              # SQLite database file (created automatically)
```

## 🚀 Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the app in development mode:

   ```bash
   npm run dev
   ```

   This launches the Express server with ViteExpress, serving the app at [http://localhost:3000](http://localhost:3000) (or `$PORT` if set).

That's it — the SQLite database (`users.db`) is created automatically on first run.

## 📜 Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts `server.js`, serving the app in development mode on port `3000` (or `$PORT`). |
| `npm start` | Starts `server.js` in production mode (serves built assets from `dist/`). Requires `NODE_ENV=production` to be set in the environment — see [Deployment](#-deployment). |
| `npm run build` | Builds the production frontend bundle with Vite, output to `dist/`. |
| `npm run preview` | Serves the built `dist/` output locally, for a quick production-like check. |
| `npm run test` | Runs the Vitest test suite (see [Testing](#-testing)). |
| `npm run lint` | Lints the codebase with `oxlint`. |

## 🧪 Testing

Tests live under `tests/` and run with [Vitest](https://vitest.dev/):

- `tests/server.test.js` — backend route tests.
- `tests/context/AuthContext.spec.jsx` — auth context logic.
- `tests/pages/LoginPage.spec.jsx` and `tests/pages/QuoteStock.spec.jsx` — page-level UI tests.

A few conventions worth knowing if you're adding tests:

- Components are rendered with the wrappers they need in real usage — typically `BrowserRouter` and `AuthProvider` (from `src/context/AuthContext.jsx`).
- `fetch` is mocked with `vi.fn()` / `vi.mockResolvedValueOnce()` rather than hitting a real backend.
- `react-router`'s `useNavigate` is mocked via `vi.mock('react-router', ...)`, and `QuoteStock.spec.jsx` mocks the `finnhub` package to stub quote lookups.
- Assertions target accessible roles, labels, placeholder text, and alt text rather than CSS classes — so restyling a page shouldn't break its tests, as long as the visible/accessible text stays the same.

## 🔌 Backend API

`server.js` initializes a SQLite database (`users.db`) with a single `users` table, and exposes:

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/signup` | Creates a new user (password hashed with bcrypt). Returns `409` if the email is already taken. |
| `POST` | `/api/login` | Verifies credentials. Returns `404` if the user isn't found, `401` on a password mismatch. |
| `POST` | `/api/logout` | Closes the SQLite connection and returns success. |
| `GET` | `/db/users` | Debug route reporting whether the SQLite connection is open. |
| `GET` | `/hello` | Simple health check. |

Note that `/db/users` and `/hello` are intentionally *not* under `/api` — they're diagnostic routes rather than part of the public API.

## 🛠️ Conventions for contributors

- The codebase is ESM-based (`"type": "module"` in `package.json`) — use `import`/`export` syntax throughout.
- Assets (images, etc.) are imported via relative paths, e.g. `import heroImg from '../assets/hero.png'`.
- Keep UI state local to components unless there's a real need for a shared/cross-component store.
- `LoginPage` and `QuoteStock` share a visual language (CSS variables from `src/index.css`, plus a purple/blue gradient for buttons and cards) — if you restyle one, consider whether the other should match.
- If you add backend routes or new dependencies, update `package.json` and make sure `npm run dev` still works end-to-end.

## 📦 Deployment

The app is deployed to [Render](https://render.com) and auto-deploys on new commits to `main`:

1. Render runs `npm install` then `npm run build` (producing the `dist/` frontend bundle).
2. Render runs `npm start` with `NODE_ENV=production` set, so the Express server serves the built frontend from `dist/` and falls back to a catch-all route for client-side routing.
3. The server listens on the `PORT` environment variable that Render provides automatically.

## 📍 Where to look first

| If you're touching... | Look at... |
| --- | --- |
| Routing / app shell | `src/main.jsx`, `src/App.jsx` |
| Login / sign-up flow | `src/context/AuthContext.jsx`, `src/pages/LoginPage.jsx` |
| Stock lookup page | `src/pages/QuoteStock.jsx` |
| Backend routes / DB setup | `server.js` |
| Test patterns / examples | `tests/pages/LoginPage.spec.jsx`, `tests/pages/QuoteStock.spec.jsx` |

