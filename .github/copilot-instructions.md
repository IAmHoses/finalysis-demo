# AI Assistant Instructions — rts-labs-coding-challenge

Purpose: help an AI coding agent work productively in this repo by describing the actual architecture, developer commands, and project-specific conventions.

- Project type: Vite-powered React app with an embedded Express backend (`server.js`).
- Frontend entry: `src/main.jsx` bootstraps `App` into `#root`.
- Root UI: `src/App.jsx`, which imports assets from `src/assets/` and styles from `src/App.css`.
- Backend entry: `server.js`; it uses `express`, `vite-express`, `bcrypt` (auth), and the Node built-in `sqlite` module.
- SQLite file: `users.db` in repo root; backend route `/api/users` returns a simple status JSON.
- Additional dependencies: `finnhub` (stock data API) and `react-router` (client-side routing).

Developer commands (from `package.json`):
- `npm run dev` → starts `node server.js` and serves the app on port `3000` via ViteExpress.
- `npm run start` → runs `NODE_ENV=production node server.js` for production mode.
- `npm run test` → runs `vitest` (unit tests in `tests/` directory).
- `npm run build` → runs `vite build`.
- `npm run preview` → runs `vite preview` against the built output.
- `npm run lint` → runs `oxlint`.

Important patterns:
- `server.js` is the actual app entrypoint in dev; do not assume `vite` CLI alone is used.
- The backend and frontend are co-located in the same repo; backend APIs are exposed under `/api/*`.
- React code is ESM-based (`type: "module"` in `package.json`), so use import syntax consistently.
- Assets are imported via relative paths inside components (example: `import heroImg from './assets/hero.png'`).
- Keep UI state local to components unless a real cross-component store is added.

Practical guidance:
- Modify frontend behavior in `src/App.jsx` and `src/main.jsx`.
- Modify backend routes or SQLite initialization in `server.js`.
- Write unit tests in `tests/` directory using Vitest (e.g., `tests/sum.test.js`). Run with `npm run test`.
- If you add backend features, update `package.json` dependencies and keep `npm run dev` semantics intact.
- Focus on manual verification by running `npm run dev` and visiting `http://localhost:3000`, or use automated tests via `npm run test`.

Deployment

- Production: deployed to [Render](https://render.com) at https://rts-labs-coding-challenge.onrender.com (automated via recent commits).
- Environment variables: `NODE_ENV` and `PORT` control dev vs. production behavior in `server.js`. In production, the app serves built assets from `dist/` and uses a catch-all to support client-side routing.
- The build process (`npm run build`) compiles React via Vite; `npm start` runs the production server. Render automatically runs `npm start` after pulling and building.

Testing (what to know)

- Test runner: Vitest (`npm run test`). Tests live under `tests/` (example: `tests/sum.test.js`, `tests/pages/LoginPage.spec.jsx`).
- React testing: tests use `@testing-library/react` and `@testing-library/user-event` for DOM assertions and user interactions (see `tests/pages/LoginPage.spec.jsx`).
- Mocking patterns: global `fetch` is commonly mocked with `vi.fn()`/`vi.mockResolvedValueOnce()`; `react-router` navigation is mocked via `vi.mock('react-router', ...)` to stub `useNavigate`.
- Test wrappers: render components with any required context and routing wrappers. Example render helper in tests uses `BrowserRouter` and `AuthProvider` from `src/context/AuthContext.jsx`.
- Backend expectations: `AuthContext` calls `http://localhost:3000/api/{login,signup,logout}`; tests mock `fetch` so they don't require a running backend.
- Files to inspect for test guidance: `tests/pages/LoginPage.spec.jsx`, `src/pages/LoginPage.jsx`, and `src/context/AuthContext.jsx`.

If you want I can add a short example `tests/setup.js` that centralizes common wrappers and mocks (recommended for larger test suites). Ask and I'll add it.