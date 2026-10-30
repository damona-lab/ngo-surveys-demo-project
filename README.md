# NGO Surveys

NGO Surveys is a browser survey dashboard with an Express API and MongoDB persistence through Mongoose. Account passwords are stored as bcrypt hashes. Sessions use a signed, HTTP-only, same-site cookie. Survey answers, progress, wallet totals, and withdrawal requests are stored per account in MongoDB.

## Local setup

1. Install Node.js 20 or newer and MongoDB.
2. Start MongoDB as a single-node replica set. A replica set is what enables multi-document transactions:

   ```sh
   mongod --dbpath %LOCALAPPDATA%\MongoDB\data --logpath %LOCALAPPDATA%\MongoDB\log\mongod.log ^
          --port 27017 --bind_ip 127.0.0.1 --replSet rs0
   ```

   Add `--auth --keyFile <keyfile>` once the users exist (see step 4). The keyfile is a
   random base64 string, for example `node -e "console.log(require('node:crypto').randomBytes(384).toString('base64'))"`.
3. Copy `.env.example` to `.env`, generate a random `MONGO_APP_PASSWORD` and `MONGO_ADMIN_PASSWORD`, build `MONGODB_URI` and `MONGO_ADMIN_URI` from them, and set a long random `JWT_SECRET`. Keep `.env` out of source control.
4. Install dependencies and create the database users:

   ```sh
   npm ci
   npm run db:setup
   ```

   `db:setup` initiates the replica set, then creates two accounts: a maintenance account
   that can only manage users, and an application account confined to the `ngo_surveys`
   database. It is idempotent, so re-run it to rotate a password. Restart `mongod` with
   `--auth --keyFile` afterwards to enforce authentication.
5. Import the survey definitions, build the frontend, and run:

   ```sh
   npm run db:seed
   npm run build
   npm start
   ```

   Visit `http://localhost:3000`.

`npm run build` compiles the React/JSX sources under `src/` into the browser bundle in
`dist/` (`dist/index.html`, `dist/assets/index.js`, `dist/assets/index.css`) using
esbuild — a compiler/bundler only, with no dev server and no Vite. `express.static`
serves that folder, and any other path falls back to `dist/index.html`. Re-run
`npm run build` after editing anything in `src/`.

There is no separate schema migration step. The Mongoose schemas in `server/models.js` declare every index, the server creates them on startup, and `npm run db:seed` upserts the survey definitions by `id`.

After a reboot, the local MongoDB is usually stopped, and the app will fail to start with `ECONNREFUSED 127.0.0.1:27017`. Start the database first, then the app:

```sh
npm run db:start   # starts the local single-node replica set; safe to re-run
npm start          # or: npm run dev
```

`npm run db:start` uses the portable install under `%LOCALAPPDATA%\MongoDB`, so it assumes that layout. `npm run dev` and `npm start` both run the same plain Node/Express server (`server/index.js`), which serves the built frontend from `dist/` together with the API on `http://localhost:3000`; there is no separate dev server or `/api` proxy. Run `npm run build` after changing anything under `src/`. The API still requires `.env` and a reachable MongoDB deployment. If startup fails, read the API error in that terminal before retrying account creation.

You can browse the same database from VS Code with the MongoDB extension by connecting to `mongodb://127.0.0.1:27017` with the account from `.env` and `authSource=ngo_surveys`.

## Data model

| Collection | Purpose |
| --- | --- |
| `users` | Accounts, bcrypt `password_hash`, wallet `balance` / `total_earned`, `status` |
| `surveys` | Survey definitions; `questions` are embedded as an ordered array |
| `user_surveys` | One document per user/survey pair holding `unlocked` |
| `user_answers` | One document per answered question with `answer_index` and `reward` |
| `withdrawals` | Payout requests with `pending`/`processing`/`paid`/`failed` status |
| `password_resets` | Single-use SHA-256 reset tokens that expire after one hour |
| `refresh_tokens` | Optional hashed refresh tokens |

Unique indexes on `users.email`, `user_surveys (user_id, survey_id)`, and `user_answers (user_id, survey_id, question_id)` are what prevents duplicate rows under concurrency.

Multi-document transactions require a replica set or sharded cluster. The server detects this on startup and uses transactions where available; on a standalone `mongod` it falls back to atomic single-document updates (the withdrawal balance guard lives in the query filter, so the wallet cannot be overdrawn). Use a replica set or Atlas cluster in production.

## Database security

- The application connects with its own account, created inside the `ngo_surveys` database and granted rights on that database only. It never authenticates as a server administrator.
- `npm run db:setup` uses a separate maintenance account with `userAdminAnyDatabase`, which can manage users but cannot read or write application data. The running application never uses it.
- Password hashes are bcrypt. The `password_hash` field is `select: false`, so it is only read by the login query and can never leak into an API response by accident.
- Every write goes through a Mongoose schema, so field lengths, enums, and value ranges are validated by the database layer as well as the route.
- Unique indexes on `users.email`, `user_surveys (user_id, survey_id)`, and `user_answers (user_id, survey_id, question_id)` are what prevent duplicate rows under concurrency, including duplicate survey answers that pay a reward.
- Reset tokens are random, stored only as SHA-256 hashes, expire after one hour, and are single-use.

## Password reset email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and the public `APP_URL`. Reset links are random, stored only as SHA-256 hashes, expire after one hour, and can be used once. Without SMTP settings the app does not send reset links.

## Deployment

**Two-host setup:** the frontend is hosted separately (e.g. Netlify) and the backend
(API + MongoDB) is hosted on **Render**.

- `render.yaml` (repo root) is a Render Blueprint: create the service with Render's
  **New > Blueprint** page and point it at this repository. It reads the file
  automatically. Render then asks for the values marked `sync: false`
  (`MONGODB_URI`, `APP_URL`, `FRONTEND_URL`, `VITE_API_BASE_URL`, SMTP credentials).
  The blueprint installs dependencies, builds the frontend, and starts the Express
  server.
- `netlify.toml` (repo root) configures the Netlify site: it runs
  `npm ci && npm run build` with `VITE_API_BASE_URL` baked in, then publishes `dist/`.
  Set `VITE_API_BASE_URL` to the backend's public HTTPS URL before deploying.

Because the frontend and backend are on different sites, the session cookie must be
`SameSite=None; Secure`, which is what `CROSS_SITE_COOKIES=true` enables on the
backend. The backend only echoes CORS headers for origins listed in `FRONTEND_URL`,
so set it to your frontend's exact origin (scheme and hostname, without a path). Set
`APP_URL` to the frontend URL for password reset links. Set `CROSS_SITE_COOKIES=true`
only when the frontend and backend are on different sites; same-site subdomains can
keep it `false`.

`npm run build` compiles the React/JSX sources under `src/` into the browser bundle in
`dist/` (`dist/index.html`, `dist/assets/index.js`, `dist/assets/index.css`) using
esbuild — a compiler/bundler only, with no dev server and no Vite. When
`VITE_API_BASE_URL` is set (Netlify build), the bundle calls `/api` on that origin;
when it is empty (same-origin Render), the bundle calls `/api` on its own origin.

To host the frontend separately from the API, set `VITE_API_BASE_URL` in the build environment (it is read by `scripts/build.mjs`) to the backend's public HTTPS URL. Set `FRONTEND_URL` on the backend to the frontend's exact origin (scheme and hostname, without a path), and set `APP_URL` to the frontend URL for password reset links. Set `CROSS_SITE_COOKIES=true` only when the frontend and backend are on different sites; same-site subdomains can keep it `false`.

Run `npm run db:seed` once against the production database from a machine that can reach it, with that database's `MONGODB_URI` in `.env`.

Use a replica set or sharded cluster so multi-document transactions are available, and enable TLS for the database connection (`DB_SSL=true`) together with HTTPS so secure session cookies are enabled. The server trusts the proxy in front of it so rate limiting counts real visitor addresses.

The previous Netlify static hosting configuration cannot provide this API or safely connect to a database. Use a Node server deployment for the authenticated app.

## Current payment limitation

The old demo accepted text copied from a payment SMS as proof. That is not verifiable, so the API does not grant paid survey unlocks based on pasted text. Integrate a payment provider with server-side payment verification before enabling paid unlocks. Withdrawal requests are saved as pending records; they do not initiate an M-Pesa transfer.
