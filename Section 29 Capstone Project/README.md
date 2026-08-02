# Section 29 Capstone Project — Weather App (External REST API Lookup)

A small Node.js/Express/EJS application that fetches the **current weather**
for a hardcoded latitude/longitude from the
[OpenWeatherMap API](https://openweathermap.org/current) using `axios`, and
renders the result with a server-side EJS template.

## How the app works

1. On startup, Express is configured with EJS as the view engine and the
   `public` folder for static assets, using absolute paths built from
   `__dirname`.
2. Visiting `GET /` triggers an `async` route handler that calls
   `axios.get()` against OpenWeatherMap's `/weather` endpoint, passing
   latitude, longitude, and an API key as query parameters.
3. The route `await`s the response, then renders `views/index.ejs`, passing
   the returned weather data (`weather.data`) so the template can display
   temperature, conditions, etc.
4. If the request fails (bad network, invalid key, API downtime), the
   `try/catch` block logs the error and responds with an HTTP `500`.

## ⚠️ Security note on this project's API key

This project currently has a **hardcoded API key** in `index.js`
(`const apiKey = "..."`). That key has already been committed to source
history and must be treated as **compromised** — see the
[Environment variable best practices](#environment-variable-best-practices)
section below for the correct pattern and remediation steps. This README
and the inline code comments intentionally do **not** repeat the key value,
to avoid drawing extra attention to it.

## Core concepts covered

| Concept | Where it shows up |
|---|---|
| `axios` GET requests with query params | `axios.get(url, { params: { lat, lon, appid } })` |
| `async`/`await` with `try/catch` for API calls | `app.get("/", async (req, res) => { try { ... } catch { ... } })` |
| ES module `__dirname` reconstruction | `fileURLToPath(import.meta.url)` + `path.dirname()` |
| Environment variables for API keys | Should use `process.env.OPENWEATHER_API_KEY` (see below) |
| EJS rendering of dynamic/external data | `res.render("index", { weather: weather.data })` |

---

## Cheat Sheet

### 1. `__dirname` / `fileURLToPath` pattern (ES Modules)

Native ES Modules (`"type": "module"` in `package.json`) don't provide the
CommonJS globals `__filename`/`__dirname`. Reconstruct them like this:

```js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // file path of this module
const __dirname = path.dirname(__filename);         // directory containing it

// Now usable for absolute paths, e.g.:
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
```

| Step | Purpose |
|---|---|
| `import.meta.url` | Gives the current module's location as a `file://` URL string |
| `fileURLToPath(...)` | Converts that URL into a normal OS filesystem path |
| `path.dirname(...)` | Strips the filename, leaving just the directory path |

### 2. `axios` GET request with a `params` object

```js
import axios from "axios";

const url = "https://api.openweathermap.org/data/2.5/weather";

const response = await axios.get(url, {
  params: {
    lat: latitude,
    lon: longitude,
    appid: apiKey, // OpenWeatherMap's expected query param name for the API key
  },
});

console.log(response.data); // parsed JSON body from the API
```

`axios` automatically serializes the `params` object into a query string
(e.g. `?lat=45.4231&lon=-75.6831&appid=...`) — no manual string concatenation
needed.

### 3. `async`/`await` with `try/catch` for API calls

```js
app.get("/", async (req, res) => {
  try {
    const weather = await axios.get(url, { params: { lat, lon, appid: apiKey } });
    res.render("index", { weather: weather.data });
  } catch (error) {
    // axios rejects the promise on network errors AND non-2xx HTTP status codes
    console.error(error.response?.data || error.message);
    res.status(500).send('Error retrieving current weather data');
  }
});
```

Key takeaway: wrapping `await` calls in `try/catch` is the standard way to
handle both network failures and API error responses gracefully, instead of
letting an unhandled rejection crash the route.

### 4. Environment variable best practices for API keys

**❌ Insecure pattern (what this project currently does):**

```js
// BAD: real key committed directly into source code / Git history
const apiKey = "d3e3929e762effd931a75ec790088405";
```

Problems with this approach:
- Anyone with repo access (or access to Git history, even after later
  removal) can read and misuse the key.
- If the repo is ever public or pushed to GitHub, bots can find and abuse
  exposed keys within minutes.
- Makes it hard to use different keys per environment (dev/staging/prod).

**✅ Recommended pattern (using `dotenv`):**

```bash
npm install dotenv
```

Create a `.env` file in the project root (and add `.env` to `.gitignore`
so it's never committed):

```
OPENWEATHER_API_KEY=your_real_key_here
```

At the very top of `index.js`:

```js
import 'dotenv/config';

const apiKey = process.env.OPENWEATHER_API_KEY;
```

| Approach | Key stored in | Committed to Git? | Safe? |
|---|---|---|---|
| Hardcoded string (current) | Source code | Yes | ❌ No |
| `process.env` + `.env` + `dotenv` | `.env` file (gitignored) | No | ✅ Yes |

> **Remediation note:** Because this project's key was already committed to
> source control, it should be treated as compromised. The correct fix is to
> rotate/regenerate a new key on the [OpenWeatherMap dashboard](https://home.openweathermap.org/api_keys)
> (or your provider's equivalent), revoke the old one, and switch to the
> `.env`-based pattern above going forward.

---

## Files in this project

- `index.js` — Express server, view engine setup, `__dirname` reconstruction, and the weather-fetching route (see inline comments, including a security warning above the hardcoded key).
- `views/index.ejs` — Template that renders the current weather data returned by the API.
- `public/style.css` — Page styling.
