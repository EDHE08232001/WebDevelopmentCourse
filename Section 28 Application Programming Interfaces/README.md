# Section 28 — Application Programming Interfaces (APIs)

Study notes covering JSON, axios, API authentication strategies, and REST conventions.
Use this as an exam-review cheat sheet for the 5 exercises in this section:

| Folder | Topic |
|---|---|
| `5.2 JSON` | JSON.stringify / JSON.parse |
| `5.3 Axios` | Making HTTP requests with axios (Bored API) |
| `5.4+API+Authentication` | 4 authentication strategies (Secrets API) |
| `5.5 REST APIs` | Full REST verb set: GET/POST/PUT/PATCH/DELETE |
| `5.6 Secrets Project` | Capstone mini-project |

---

## 1. What is an API?

An **API (Application Programming Interface)** is a set of rules that lets one piece of
software talk to another. A **web API** typically lets your app send an HTTP request to
a server (e.g. `GET https://bored-api.appbrewery.com/random`) and get back a response —
usually formatted as **JSON** — containing the data you asked for.

Key vocabulary:

- **Endpoint** — a specific URL path an API exposes (e.g. `/random`, `/secrets/42`).
- **Request** — what your app sends (method, URL, headers, optional body).
- **Response** — what the server sends back (status code, headers, body).
- **Status code** — a number summarizing the outcome (`200` OK, `201` Created, `404` Not
  Found, `401` Unauthorized, `500` Server Error, etc.).

## 2. JSON basics: `stringify` and `parse`

**JSON (JavaScript Object Notation)** is a plain-text data format used to exchange data
between systems. It looks like a JavaScript object/array, but it's just a **string** —
that's what makes it possible to send over HTTP or save to a file.

```js
const data = { name: "Chicken Taco", price: 2.99 };

// JS Object -> JSON string (e.g. to send in an HTTP request body)
const jsonData = JSON.stringify(data);
// '{"name":"Chicken Taco","price":2.99}'

// JSON string -> JS Object (e.g. after receiving an API response)
const parsedBack = JSON.parse(jsonData);
// { name: "Chicken Taco", price: 2.99 }
```

- Use `JSON.stringify()` whenever you need to **send** a JS object somewhere as text
  (API request bodies, `localStorage`, log files).
- Use `JSON.parse()` whenever you **receive** text that represents an object and need to
  work with it as real JS data (accessing `.property` or `[index]`).
- In practice, axios does this for you automatically for HTTP request/response bodies —
  you usually only call these manually when handling raw strings yourself (see
  `5.2 JSON/index.js`, which stores a full API-like payload as a literal JSON string).

## 3. Making HTTP requests with axios

[`axios`](https://axios-http.com/) is a popular npm package for making HTTP requests
from Node.js or the browser. It returns **Promises**, so it pairs naturally with
`async`/`await` and `try`/`catch` for clean, readable error handling.

```js
import axios from "axios";

app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/random");
    const result = response.data; // axios auto-parses JSON responses for you
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", { error: error.message });
  }
});
```

Notes:

- `response.data` already contains a parsed JS object/array — axios handles the
  `JSON.parse()` step for you on the way in, and `JSON.stringify()` on the way out for
  request bodies.
- Always wrap `await axios...` calls in `try/catch`. Axios throws an error for
  network failures *and* for non-2xx status codes, so `catch` is where you handle both.
- `error.response.data` (when available) often contains the API's own error message,
  which is more useful to log/display than the generic `error.message`.

### The 5 axios HTTP methods

```js
axios.get(url, config);           // read data
axios.post(url, body, config);    // create data
axios.put(url, body, config);     // replace data
axios.patch(url, body, config);   // partially update data
axios.delete(url, config);        // remove data
```

## 4. API authentication strategies

Many APIs restrict access so only authorized clients can use them. This section covers
4 common strategies, all demonstrated in `5.4+API+Authentication/index.js` and
`5.5 REST APIs/index.js` against the Secrets API.

| Strategy | How credentials are sent | Typical use case | Security notes |
|---|---|---|---|
| **No Auth** | Nothing — request is open | Public, read-only, non-sensitive data | Anyone can call it; no accountability |
| **Basic Auth** | Username + password, base64-encoded into an `Authorization: Basic ...` header | Simple internal tools, quick prototypes | Base64 is *not* encryption — only safe over HTTPS |
| **API Key** | A key issued to your app, sent as a query parameter or custom header | Metered/rate-limited public APIs | Key identifies the app, not necessarily a specific user |
| **Bearer Token** | A token (often a JWT) sent in an `Authorization: Bearer <token>` header | Logged-in user sessions, OAuth-protected APIs | Token itself is the credential — protect it like a password |

### No Auth

```js
// Public endpoint — no credentials needed at all.
const result = await axios.get(API_URL + "/random");
```

### Basic Auth

Axios has a built-in `auth` option — pass it your username/password and axios encodes
them for you (you never manually build the header):

```js
const result = await axios.get(API_URL + "/all?page=2", {
  auth: {
    username: yourUsername,
    password: yourPassword,
  },
});
// Under the hood, axios sends:
// Authorization: Basic <base64("username:password")>
```

### API Key (as a query parameter)

```js
const result = await axios.get(API_URL + "/filter", {
  params: {
    score: 5,
    apiKey: yourAPIKey, // becomes ?score=5&apiKey=xxxx in the URL
  },
});
```

Some APIs instead expect the key in a header (e.g. `x-api-key`) — always check the docs.

### Bearer Token

```js
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};
const result = await axios.get(API_URL + "/secrets/2", config);
```

## 5. REST API conventions

**REST (Representational State Transfer)** is a convention for designing APIs where each
URL represents a **resource** (e.g. a "secret", a "user"), and the **HTTP verb** you use
against that URL describes the **action** you want to perform on it.

| HTTP Verb | Action | Meaning | Body sent? |
|---|---|---|---|
| `GET` | **Read** | Fetch a resource or list of resources | No |
| `POST` | **Create** | Create a new resource | Yes — the new resource's data |
| `PUT` | **Replace** | Replace an entire existing resource | Yes — the *full* resource |
| `PATCH` | **Update** | Partially update an existing resource (only the given fields) | Yes — only fields to change |
| `DELETE` | **Remove** | Delete an existing resource | Usually no |

Example from `5.5 REST APIs/index.js` (all against the Secrets API):

```js
// READ a secret by id
await axios.get(API_URL + "/secrets/" + id, config);

// CREATE a new secret
await axios.post(API_URL + "/secrets", req.body, config);

// REPLACE a secret entirely
await axios.put(API_URL + "/secrets/" + id, req.body, config);

// PARTIALLY UPDATE a secret (only changed fields)
await axios.patch(API_URL + "/secrets/" + id, req.body, config);

// DELETE a secret
await axios.delete(API_URL + "/secrets/" + id, config);
```

**PUT vs. PATCH — the key exam distinction:** PUT expects (and typically overwrites with)
the *entire* resource representation, so any field you omit may be wiped/reset. PATCH
only touches the specific fields you include in the request body, leaving the rest of
the resource unchanged.

## 6. Security best practices — never hardcode secrets

The `5.4+API+Authentication` and `5.5 REST APIs` exercises intentionally leave variables
like `yourUsername`, `yourPassword`, `yourAPIKey`, and `yourBearerToken` **blank** —
that's a deliberate placeholder for you to fill in locally while practicing, not a
real credential.

> ⚠️ **Never commit real API keys, tokens, or passwords to source code or git history —
> not even in a "private" repository.**  Secrets committed to git can leak through
> public forks, screen shares, CI logs, or if the repo's visibility ever changes.

**The safe pattern for any real project:**

1. Install `dotenv`:
   ```bash
   npm install dotenv
   ```
2. Create a `.env` file in your project root (never commit this file):
   ```env
   USERNAME=myUsername
   PASSWORD=myPassword
   API_KEY=abc123
   BEARER_TOKEN=eyJhbGciOi...
   ```
3. Add `.env` to your `.gitignore`:
   ```gitignore
   node_modules/
   .env
   ```
4. Load and use the variables in code via `process.env`:
   ```js
   import "dotenv/config";

   const yourUsername = process.env.USERNAME;
   const yourPassword = process.env.PASSWORD;
   const yourAPIKey = process.env.API_KEY;
   const yourBearerToken = process.env.BEARER_TOKEN;
   ```

**If a secret was ever accidentally committed** to git (even once, even if later
deleted), treat it as compromised: **rotate it** — regenerate or revoke the credential
with the API provider and replace it with a new one — because it may still exist in the
repository's git history even after being removed from the current files.

---

## 7. Cheat sheet — ready-to-copy axios snippets

**GET (read), no auth:**
```js
const result = await axios.get("https://api.example.com/random");
```

**GET with Basic Auth:**
```js
const result = await axios.get("https://api.example.com/all", {
  auth: { username: process.env.USERNAME, password: process.env.PASSWORD },
});
```

**GET with API Key (query param):**
```js
const result = await axios.get("https://api.example.com/filter", {
  params: { apiKey: process.env.API_KEY },
});
```

**GET with Bearer Token:**
```js
const config = { headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` } };
const result = await axios.get("https://api.example.com/secrets/42", config);
```

**POST (create):**
```js
const result = await axios.post("https://api.example.com/secrets", req.body, config);
```

**PUT (replace):**
```js
const result = await axios.put(`https://api.example.com/secrets/${id}`, req.body, config);
```

**PATCH (partial update):**
```js
const result = await axios.patch(`https://api.example.com/secrets/${id}`, req.body, config);
```

**DELETE (remove):**
```js
const result = await axios.delete(`https://api.example.com/secrets/${id}`, config);
```

**Standard error-handling wrapper:**
```js
try {
  const result = await axios.get(url, config);
  res.render("index.ejs", { content: JSON.stringify(result.data) });
} catch (error) {
  // error.response.data often contains the API's own error message
  res.render("index.ejs", { content: JSON.stringify(error.response.data) });
}
```

---

### References

- [axios documentation](https://axios-http.com/docs/intro)
- [axios basic auth example (Stack Overflow)](https://stackoverflow.com/a/74632908)
- [axios bearer token example (Stack Overflow)](https://stackoverflow.com/a/52645402)
- [MDN: JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN: JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [MDN: HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [dotenv package (npm)](https://www.npmjs.com/package/dotenv)
- [Bored API](https://bored-api.appbrewery.com) — used in `5.3 Axios`
- [Secrets API](https://secrets-api.appbrewery.com) — used in `5.4+API+Authentication`, `5.5 REST APIs`, and `5.6 Secrets Project`
