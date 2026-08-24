# AI Assistant Instructions — finalysis-demo

Purpose: help an AI coding agent work productively in this repo by describing the actual architecture, developer commands, and project-specific conventions.

- Project type: Vite-powered React app with an embedded Express backend (`server.js`).
- Frontend entry: `src/main.jsx` sets up a `react-router` `createBrowserRouter` with routes `/` (`App`), `/login` (`LoginPage`), and `/quote-stock` (`QuoteStock`). `LoginPage` and `QuoteStock` are each wrapped in `AuthProvider` via local `*WithAuth` wrapper components.
- Root UI: `src/App.jsx`, which imports assets from `src/assets/` and styles from `src/App.css`.
- Pages live in `src/pages/`: `LoginPage.jsx`/`LoginPage.css` (tabbed Sign In / Sign Up form) and `QuoteStock.jsx`/`QuoteStock.css` (stock ticker lookup + logout, styled to match `LoginPage`'s card/gradient theme but without tabs). Note: `QuoteStock` was previously named `StockLookupPage` — if you see stale references to that name or a `/stock-lookup` route, update them.
- Backend entry: `server.js`; it uses `express`, `vite-express`, `bcrypt` (password hashing), and the Node built-in `node:sqlite` module (`DatabaseSync`).
- SQLite file: `users.db` in repo root, with a `users` table (`id`, `email`, `password`).
- Additional dependencies: `finnhub` (stock data API, used in `QuoteStock.jsx`) and `react-router`/`react-router-dom` (client-side routing).

Backend routes (actual, from `server.js`):
- `POST /api/signup` — creates a user (hashes password with bcrypt), 409 if user exists.
- `POST /api/login` — verifies credentials, returns a generic 401 for either an unknown email or a wrong password (avoids user enumeration).
- `POST /api/logout` — closes the SQLite connection, always returns success.
- In production (`NODE_ENV=production`), Express serves `dist/` statically and uses a catch-all route to support client-side routing.

Developer commands (from `package.json`):
- `npm run dev` → runs `node server.js`, which launches ViteExpress on port `3000` (or `process.env.PORT`).
- `npm run start` → runs `node server.js` in production mode; production behavior is gated on the `NODE_ENV=production` environment variable being set externally (e.g., by Render), not by the npm script itself.
- `npm run test` → runs `vitest` (unit tests in `tests/` directory).
- `npm run build` → runs `vite build`.
- `npm run preview` → runs `vite preview` against the built output.
- `npm run lint` → runs `oxlint`.

Important patterns:
- `server.js` is the actual app entrypoint in dev; do not assume `vite` CLI alone is used.
- The backend and frontend are co-located in the same repo; backend auth routes are exposed under `/api/*`.
- React code is ESM-based (`type: "module"` in `package.json`), so use import syntax consistently.
- Assets are imported via relative paths inside components (example: `import heroImg from '../assets/hero.png'`).
- Keep UI state local to components unless a real cross-component store is added.
- Shared visual language: `LoginPage.css` and `QuoteStock.css` both use CSS variables from `src/index.css` (`--bg`, `--text-h`, `--border`, etc.) plus a consistent purple/blue gradient (`#667eea` → `#764ba2`) for primary buttons and card styling. When restyling one page, check whether the same treatment should apply to the other for visual consistency.

Practical guidance:
- Modify frontend behavior in `src/App.jsx`, `src/main.jsx`, or the relevant file under `src/pages/`.
- Modify backend routes or SQLite initialization in `server.js`.
- Write unit tests in `tests/` directory using Vitest (e.g., `tests/server.test.js`, `tests/pages/*.spec.jsx`). Run with `npm run test`.
- If you add backend features, update `package.json` dependencies and keep `npm run dev` semantics intact.
- Focus on manual verification by running `npm run dev` and visiting `http://localhost:3000`, or use automated tests via `npm run test`.
- When renaming a component/page, search the whole repo (source, tests, comments) for the old name — stale references (imports, comments, route paths) are easy to miss.

Deployment

- Production: deployed to [Render](https://render.com) at https://finalysis-demo.onrender.com (automated via recent commits).
- Environment variables: `NODE_ENV` and `PORT` control dev vs. production behavior in `server.js`. In production, the app serves built assets from `dist/` and uses a catch-all to support client-side routing.
- The build process (`npm run build`) compiles React via Vite; `npm start` runs the production server. Render automatically runs `npm install`, `npm run build`, and then `npm start` on new commits.

Testing (what to know)

- Test runner: Vitest (`npm run test`). Tests live under `tests/`: `tests/server.test.js`, `tests/setup.js` (imports `@testing-library/jest-dom`), `tests/context/AuthContext.spec.jsx`, `tests/pages/LoginPage.spec.jsx`, and `tests/pages/QuoteStock.spec.jsx`.
- React testing: tests use `@testing-library/react` and `@testing-library/user-event` for DOM assertions and user interactions.
- Mocking patterns: global `fetch` is commonly mocked with `vi.fn()`/`vi.mockResolvedValueOnce()`; `react-router` navigation is mocked via `vi.mock('react-router', ...)` to stub `useNavigate`; `QuoteStock.spec.jsx` mocks the `finnhub` module to stub the quote API.
- Test wrappers: render components with any required context and routing wrappers. Render helpers wrap components in `BrowserRouter` and `AuthProvider` from `src/context/AuthContext.jsx`.
- Backend expectations: `AuthContext` calls `http://localhost:3000/api/{login,signup,logout}`; tests mock `fetch` so they don't require a running backend.
- Test assertions target accessible roles/labels/placeholder text rather than CSS class names — when restyling a page, keep label text, placeholder text, button names, and alt text stable so existing tests keep passing.
- Files to inspect for test guidance: `tests/pages/LoginPage.spec.jsx`, `tests/pages/QuoteStock.spec.jsx`, `src/pages/LoginPage.jsx`, `src/pages/QuoteStock.jsx`, and `src/context/AuthContext.jsx`.
