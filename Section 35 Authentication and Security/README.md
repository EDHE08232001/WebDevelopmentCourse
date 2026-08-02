# Section 35 — Authentication and Security

Study notes for the **Authentication & Security** section of the Node.js + Express course. This section is built as five progressive practice apps (`practice1` → `practice5`), each an independent Express + EJS app with its own `package.json`, `index.js` (the student exercise file), and `solution.js` (the reference answer — do not edit). Together they walk through the evolution of a login system from "dangerously naive" to "reasonably production-aware."

## 1. The progression across practice1 → practice5

| Practice | What it adds | Key files |
|---|---|---|
| **practice1** | Basic registration/login backed by a raw PostgreSQL `users` table. Passwords are stored and compared as **plaintext**. No sessions — every request re-checks credentials with nothing remembered. | `practice1/index.js` |
| **practice2** | Same flow, but passwords are now **hashed with bcrypt** (`bcrypt.hash` on register, `bcrypt.compare` on login) instead of stored as plaintext. | `practice2/index.js` |
| **practice3Sessions&Cookies** | Adds **express-session** + **Passport.js** (`passport-local`) so a logged-in user stays logged in across requests via a signed session cookie, instead of re-authenticating on every page. Introduces `serializeUser`/`deserializeUser` and a protected `/secrets` route gated by `req.isAuthenticated()`. | `practice3Sessions&Cookies/index.js`, `Serialization&Deserialization.md` |
| **practice4** | Moves every secret (DB credentials, session secret) out of source code and into **environment variables** loaded via `dotenv` + `process.env`. Adds a `/logout` route (`req.logout()`). | `practice4/index.js`, `practice4/README.md` |
| **practice5** | Adds **Google OAuth 2.0 login** via `passport-google-oauth2` (`GoogleStrategy`) alongside the existing local strategy, so a user can sign in either with an email/password or by delegating identity to Google. | `practice5/index.js` |

The throughline is a single lesson repeated with increasing sophistication: **never trust plaintext passwords or hardcoded secrets**, and **use a proper session mechanism to track "is this request authenticated?"**

> **Note on this repo's own hygiene:** while reading the code you'll notice `practice1`–`practice3` hardcode real-looking database credentials, and `practice3Sessions&Cookies/index.js` hardcodes a session secret (`"TOPSECRETWORD"`). `practice4/.env` and `practice5/.env` are also committed directly in this repository (there's no `.gitignore` excluding them). These are called out with `SECURITY WARNING` comments directly in the code. In a real project, any committed secret should be treated as compromised and rotated — see the checklist at the bottom of this document.

## 2. Session-based vs. token-based authentication

| | **Session-based** (used in practice3–5) | **Token-based** (e.g. JWT) |
|---|---|---|
| **Where state lives** | Server-side (in-memory store, Redis, DB, etc.) — the server remembers who's logged in. | Client-side — the token itself encodes the user's identity/claims. |
| **What the client holds** | A cookie containing only a signed **session ID** (an opaque reference). | The full token (e.g. a JWT), typically stored in a cookie, `localStorage`, or sent as an `Authorization: Bearer <token>` header. |
| **Revocation** | Easy — delete the session server-side and the user is instantly logged out everywhere. | Harder — a stateless JWT remains valid until it expires unless you maintain a blocklist. |
| **Scalability** | Requires a shared session store (e.g. Redis) across multiple server instances. | Naturally stateless and scales horizontally — any server can verify the token without shared state. |
| **Typical use case** | Traditional server-rendered web apps (like these EJS practice apps). | APIs, mobile apps, single-page apps, microservices. |
| **CSRF exposure** | Cookies are sent automatically by the browser, so session-based auth needs CSRF protection. | Tokens sent via `Authorization` headers are not automatically attached by the browser, reducing (but not eliminating) CSRF risk. |

This section teaches **session-based authentication** with `express-session` and Passport.js, which is the classic pattern for server-rendered apps.

## 3. Why plaintext password storage is dangerous (practice1)

In `practice1/index.js`, registration does:

```js
await db.query(
  "INSERT INTO users (email, password) VALUES ($1, $2);",
  [email, password] // raw, human-readable password
);
```

and login does a direct string comparison:

```js
if (password === storedPassword) { /* ... */ }
```

This is dangerous because:

- **A single database leak exposes every user's real password**, not just a hash of it. Data breaches happen even to careful organizations (misconfigured backups, SQL injection, insider access, stolen credentials).
- **Password reuse amplifies the damage.** Most people reuse passwords across sites, so a leak from one small app can compromise a user's email, banking, or social accounts elsewhere.
- **There's no way to "undo" the exposure.** Once plaintext passwords are out, every affected user must change their password everywhere they reused it.
- Regulations (GDPR, CCPA, PCI-DSS, etc.) and basic due diligence all require passwords to be hashed at rest — storing plaintext is considered professional negligence in real-world software.

**The fix** (`practice2/index.js` onward): never store or compare raw passwords — only store a one-way hash, and compare hashes, not plaintext.

## 4. How bcrypt hashing + salting works (conceptually)

```js
import bcrypt from "bcrypt";
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  // `hash` is what gets stored in the database, e.g.:
  // $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
});
```

- **Hashing** runs the password through a one-way mathematical function. Given the output hash, it is computationally infeasible to recover the original password.
- **Salting** adds random data (the "salt") to the password before hashing, so that two users with the identical password get *different* hashes. This defeats precomputed lookup tables (**rainbow tables**) — an attacker can't just look up a hash in a dictionary of known hash→password pairs.
- bcrypt **generates and embeds the salt automatically** inside the resulting hash string, so you don't need a separate column to store it — `bcrypt.compare` extracts the salt back out of the stored hash to verify a login attempt.
- **`saltRounds`** (a.k.a. the "cost factor") controls how many times the hashing algorithm internally iterates. Higher values make each hash slower to compute — intentionally, so that brute-forcing millions of guesses becomes impractically slow for an attacker, while a single legitimate login check still takes a fraction of a second. A value like `10`–`12` is a common, reasonable default in 2024+.
- Because hashing is one-way, verifying a login doesn't "decrypt" the stored hash — instead `bcrypt.compare(inputPassword, storedHash)` re-hashes the input using the same embedded salt and checks whether the results match.

**Never** use fast general-purpose hash functions like **MD5** or **SHA-1/SHA-256** alone for passwords — they're designed to be *fast*, which is exactly the wrong property for password hashing (it makes brute-forcing cheap). Use a purpose-built, slow, salted algorithm like **bcrypt**, **scrypt**, or **Argon2**.

## 5. How express-session works

```js
import session from "express-session";

app.use(session({
  secret: process.env.SESSION_SECRET, // signs the session-ID cookie
  resave: false,
  saveUninitialized: true,
}));
```

Conceptually:

1. On a user's first request, `express-session` creates a **session object** and stores it **server-side** (by default, in memory — in production you'd use a store like Redis or PostgreSQL via `connect-pg-simple`, since the in-memory store doesn't scale past one process and loses data on restart).
2. The server sends the browser a cookie containing only the **session ID**, cryptographically **signed** using the `secret`. Signing prevents a client from forging or tampering with the ID (they can't create a valid signature without knowing the secret).
3. On every subsequent request, the browser automatically re-sends that cookie. `express-session` verifies the signature, looks up the matching session data server-side, and attaches it as `req.session`.
4. When combined with Passport (`app.use(passport.session())`), Passport uses `req.session` to look up *who* is logged in via `deserializeUser`, and exposes the result as `req.user`.

Key config options:

| Option | Meaning |
|---|---|
| `secret` | Used to sign the session ID cookie. **Must** come from an environment variable, never be hardcoded, and should be a long random string. |
| `resave` | If `false`, avoids re-saving a session to the store on every request when nothing changed (better performance, avoids race conditions). |
| `saveUninitialized` | If `true`, saves new-but-unmodified sessions (useful for tracking anonymous visitors or letting a session exist before login); if `false`, only saves sessions once something is stored in them (better for privacy/GDPR and reduces storage of empty sessions). |
| `cookie.maxAge` | How long (in ms) the cookie stays valid before the browser discards it. |
| `cookie.secure` | If `true`, the cookie is only sent over HTTPS — should be `true` in production. |
| `cookie.httpOnly` | If `true` (the default), blocks client-side JavaScript from reading the cookie via `document.cookie`, reducing the impact of XSS attacks. |

## 6. Cheat sheet

### bcrypt: hash + compare

```js
import bcrypt from "bcrypt";

const saltRounds = 10;

// Hashing a password before storing it (registration)
bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  // Save `hash` to the database — never save `plainPassword`
});

// Verifying a password at login time
bcrypt.compare(plainPassword, storedHashFromDb, (err, isMatch) => {
  if (err) {
    console.error(err);
    return;
  }
  if (isMatch) {
    // correct password
  } else {
    // incorrect password
  }
});
```

### express-session setup

```js
import session from "express-session";
import env from "dotenv";
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET, // from .env, never hardcoded
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true, // block client-side JS access to the cookie
    },
  })
);
```

### Protected-route middleware pattern

```js
// Reusable middleware — drop this in front of any route that requires login
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    // Passport-based check (session-backed)
    return next();
  }
  // Alternative without Passport: check req.session directly, e.g.
  // if (req.session && req.session.userId) return next();
  res.redirect("/login");
}

app.get("/secrets", requireAuth, (req, res) => {
  res.render("secrets.ejs");
});
```

### Security checklist

- [ ] **Never commit secrets** (DB passwords, session secrets, OAuth client secrets, API keys) to source control — load them from environment variables via `dotenv` + a `.env` file, and add `.env` to `.gitignore`.
- [ ] **Treat any already-committed secret as compromised** — rotate/regenerate it, don't just delete the line.
- [ ] **Use HTTPS in production** so cookies, credentials, and session data aren't sent in plaintext over the network.
- [ ] **Hash passwords with bcrypt (or scrypt/Argon2)** — never MD5, SHA-1, or plain SHA-256 for passwords, and never store plaintext passwords.
- [ ] **Set `secure: true` and `httpOnly: true`** on session cookies in production, and choose a sensible `maxAge`.
- [ ] **Use a persistent session store** (Redis, PostgreSQL, etc.) in production instead of the default in-memory store, which leaks memory and loses all sessions on restart.
- [ ] **Validate and sanitize user input** on registration/login forms to avoid SQL injection (use parameterized queries, as `pg` does with `$1`, `$2`, ... placeholders).
- [ ] **Rate-limit login attempts** to slow down brute-force/credential-stuffing attacks.

## 7. Where to look in this repo

- Plaintext password anti-pattern → `practice1/index.js`
- bcrypt hashing + salting → `practice2/index.js`
- Sessions, cookies, Passport `LocalStrategy`, serialize/deserialize → `practice3Sessions&Cookies/index.js` and `practice3Sessions&Cookies/Serialization&Deserialization.md`
- Environment variables + `dotenv` → `practice4/index.js` and [`practice4/README.md`](./practice4/README.md)
- Google OAuth 2.0 login → `practice5/index.js`

Each `index.js` in this section now has inline comments explaining imports, middleware, hashing, session/cookie configuration, route handlers, and (where relevant) `SECURITY WARNING` notes flagging hardcoded secrets found in the original course code.
