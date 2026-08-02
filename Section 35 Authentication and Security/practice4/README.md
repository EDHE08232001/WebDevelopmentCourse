# Introduction to Environment Variables For Security

This practice builds on `practice3Sessions&Cookies` (sessions + cookies + Passport `LocalStrategy`) by removing every hardcoded secret from `index.js` and loading them instead from **environment variables** via the [`dotenv`](https://www.npmjs.com/package/dotenv) package. It's the fix for the hardcoded database credentials and session secret you'll find flagged with `SECURITY WARNING` comments in `practice1`–`practice3Sessions&Cookies`'s `index.js` files.

## What this practice demonstrates

Compare `practice3Sessions&Cookies/index.js`:

```js
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "secrets",
  password: "edward0823", // hardcoded — visible to anyone who reads this file or the git history
  port: 5432,
});

app.use(session({
  secret: "TOPSECRETWORD", // hardcoded session-signing secret
  // ...
}));
```

with `practice4/index.js`:

```js
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD, // pulled from the environment at runtime
  port: process.env.PG_PORT,
});

app.use(session({
  secret: process.env.SESSION_SECRET, // pulled from the environment at runtime
  resave: false,
  saveUninitialized: true,
}));
```

The application logic is identical — only *where the secret values come from* changes. This is the single most important habit for writing secure, shareable Node.js code: **source code should never contain real secrets**, because source code gets committed to git, pushed to GitHub, copy-pasted into tutorials, and read by teammates.

## How `dotenv` + `process.env` work

1. **`process.env`** is a built-in Node.js object containing all environment variables available to the running process (the same ones you'd set with `export VAR=value` in a shell, or that a hosting platform like Heroku/Render/Railway injects at deploy time).
2. During local development, it's inconvenient to `export` a dozen variables by hand every time, so the **`dotenv`** package reads a `.env` file in your project root and copies its key/value pairs into `process.env` for you — but only for local development. In production, you typically set real environment variables directly in your hosting platform's dashboard/config instead of shipping a `.env` file at all.
3. Loading dotenv early in your entry file makes the variables available to *everything* that runs afterward:

```js
import env from "dotenv";
env.config(); // reads .env and populates process.env

// or, more commonly in modern Node/ESM projects, a single side-effecting import:
// import 'dotenv/config';
```

```js
// CommonJS equivalent:
require('dotenv').config();
```

### Example `.env` file

Below is an **illustrative example only** — these are placeholder/fake values, not real credentials. A real `.env` should contain your project's actual local configuration and must never be committed to git.

```env
# Session
SESSION_SECRET=replace_with_a_long_random_string_of_your_own

# PostgreSQL connection
PG_USER=example_user
PG_HOST=localhost
PG_DATABASE=example_database
PG_PASSWORD=replace_with_a_strong_local_password
PG_PORT=5432

# (practice5 also adds Google OAuth credentials, following the same pattern)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=replace_with_your_oauth_client_secret
```

Loading it and using the values:

```js
import express from "express";
import session from "express-session";
import env from "dotenv";

env.config(); // must run before you read any process.env.* values below

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
```

## Why `.env` must be in `.gitignore`

A `.env` file typically contains real, working credentials for your database, third-party APIs, and session signing. If it's committed to git:

- It becomes permanently readable in the repository's history, even if you delete it in a later commit — anyone who clones the repo can `git log -p` their way back to it.
- Public repositories expose it to the entire internet; automated bots actively scan GitHub for leaked `.env` files and API keys within seconds of a push.
- Even in a private repo, every collaborator (and anyone who later gains access) can read it.

The fix is a one-line addition to a project-root `.gitignore`:

```gitignore
# Environment variables — never commit real secrets
.env
```

Then commit a **`.env.example`** file instead, with the same variable names but placeholder values (like the example above), so other developers know what variables they need to supply without ever seeing real secrets.

> **Note on this repository:** this `practice4` folder (and `practice5`) currently contain a committed `.env` file, and there is no `.gitignore` in this section excluding it. That means any real-looking values inside those files should be treated as already exposed/compromised — in a real project you would rotate those credentials immediately and retroactively add `.env` to `.gitignore` (plus scrub it from git history if it contained live secrets).

## See also

- [`../README.md`](../README.md) — full Section 35 study notes, including the security checklist and session/token auth comparison.
- `index.js` in this folder — inline comments walk through exactly where each `process.env.*` value is used.
