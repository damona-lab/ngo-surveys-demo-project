# NGO Surveys

NGO Surveys is a browser survey dashboard with an Express API and MySQL persistence. Account passwords are stored as bcrypt hashes. Sessions use a signed, HTTP-only, same-site cookie. Survey answers, progress, wallet totals, and withdrawal requests are stored per account in MySQL.

## Local setup

1. Install Node.js 20 or newer and MySQL 8.
2. Create a MySQL database and least-privilege application user, then apply the schema:

   ```sh
   mysql -u root -p < server/schema.sql
   ```

3. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`, database credentials, and `APP_URL`. Keep `.env` out of source control.
4. Install dependencies, import the survey definitions, and run the app:

   ```sh
   npm ci
   npm run db:seed
   npm run build
   npm start
   ```

   Visit `http://localhost:3000`.

`npm run dev` starts both Vite and the Express API, and proxies `/api` requests to the API. The API still requires `.env` and a reachable MySQL database. If startup fails, read the API error in that terminal before retrying account creation.

## Password reset email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and the public `APP_URL`. Reset links are random, stored only as SHA-256 hashes, expire after one hour, and can be used once. Without SMTP settings the app does not send reset links.

## Deployment

Deploy as a Node web service, not as a static-only site. `deployments/render.yaml` builds the Vite assets and starts the Express server. Supply a reachable managed MySQL 8 database and the database, SMTP, `JWT_SECRET`, and `APP_URL` environment variables in the hosting provider. Enable TLS for the database connection (`DB_SSL=true`) and use HTTPS so secure session cookies are enabled. Run `npm run db:seed` after applying `server/schema.sql` to the production database.

The previous Netlify static hosting configuration cannot provide this API or safely connect to MySQL. Use a Node server deployment for the authenticated app.

## Current payment limitation

The old demo accepted text copied from a payment SMS as proof. That is not verifiable, so the API does not grant paid survey unlocks based on pasted text. Integrate a payment provider with server-side payment verification before enabling paid unlocks. Withdrawal requests are saved as pending records; they do not initiate an M-Pesa transfer.
