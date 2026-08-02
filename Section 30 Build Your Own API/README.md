# Section 30 Notes

This section is about building your own REST API from scratch with
Node.js and Express — receiving HTTP requests, reading data from the
request (params, query, body), manipulating an in-memory data store, and
sending back appropriate JSON responses and status codes.

## What makes an API RESTful?

REST ("**RE**presentational **S**tate **T**ransfer") is an architectural
style for designing networked APIs. An API is considered RESTful when it
follows these principles:

1. **HTTP Methods** — Use standard HTTP verbs to signal the *type* of
   action being performed on a resource:
   - `GET` — read/retrieve a resource (safe, does not modify data)
   - `POST` — create a new resource
   - `PUT` — replace an existing resource entirely
   - `PATCH` — partially update an existing resource
   - `DELETE` — remove a resource

2. **JSON Output** — Responses are typically returned as JSON (rather than
   HTML), making the API easy to consume from any client (browser,
   mobile app, another server, `curl`, Postman, etc.). In Express this is
   done with `res.json(data)`.

3. **Client — Server separation** — The client (e.g. a front end or mobile
   app) and the server (the API) are independent of each other:
   - The client only knows *how* to talk to the API (the routes/contract),
     not how the server is implemented internally.
   - Client and server can be developed, deployed, and scaled up or down
     independently from each other.

4. **Stateless** — Each request from a client to the server must contain
   all the information needed to understand and process that request. The
   server does **not** store any client session state between requests —
   every request stands on its own.

   ![Stateless illustration](./assets/statelessIllustration.png)

5. **Resource-Based** — Everything the API exposes is modeled as a
   "resource," addressed by a **U**niform **R**esource **I**dentifier /
   **L**ocator (URI/URL), e.g. `/jokes`, `/jokes/1`, `/posts/3`. Actions on
   a resource are expressed by combining the URL with an HTTP method
   (`GET /jokes/1`, `DELETE /jokes/1`, etc.) rather than by encoding the
   action in the URL itself (e.g. avoid `/deleteJoke?id=1`).

**Note:** The (World Wide) Web/Internet itself is considered one of the
most successful, large-scale implementations of the REST architectural
style.

## Query vs Body

### Query Parameters

**Query parameters** are appended directly to the URL and do not require
any special middleware to be sent. They are suitable for sending simple
key-value pairs along with GET requests (e.g. filtering, searching,
pagination, or a simple auth key like the DIY API's master key).

### Example:

1. **Server-side (Express):**
    ```javascript
    const express = require('express');
    const app = express();

    app.get("/search", (req, res) => {
      const keyword = req.query.keyword;  // Access query parameter
      res.send(`Search results for keyword: ${keyword}`);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

2. **Client-side (Browser or Postman):**
    - **URL:**
      ```
      http://example.com/search?keyword=funny+jokes
      ```
    - You can also use a browser or Postman to send a GET request to the URL above.

### Request Body

**Request bodies** are used to send data with POST, PUT, and PATCH requests. This data is not visible in the URL and can include complex data structures. To handle request bodies in Express, you typically use middleware like `express.json()` to parse JSON request bodies.

### Sending request bodies requires a client-side library like Axios or Fetch API.

### Example:

1. **Server-side (Express):**
    ```javascript
    const express = require('express');
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    app.post("/jokes", (req, res) => {
      const newJoke = {
        id: jokes.length + 1,
        jokeText: req.body.text,  // Access data from request body
        jokeType: req.body.type,  // Access data from request body
      };
      jokes.push(newJoke);
      res.json(newJoke);
    });

    const jokes = [];
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

2. **Client-side (using Axios):**

    **Installation:**
    - First, you need to install Axios if you haven't already:
      ```sh
      npm install axios
      ```

    **Sending a POST request:**
    ```javascript
    const axios = require('axios');

    const newJoke = {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      type: "pun"
    };

    axios.post('http://example.com/jokes', newJoke)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    ```

3. **Client-side (using Fetch API):**

    **Sending a POST request:**
    ```javascript
    const newJoke = {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      type: "pun"
    };

    fetch('http://example.com/jokes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newJoke)
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    ```

### Summary

- **Query Parameters**: 
  - Used with GET requests.
  - Sent directly in the URL.
  - No special middleware required for sending; can be sent using standard URL formatting.

- **Request Body**:
  - Used with POST, PUT, PATCH requests.
  - Sent in the body of the HTTP request.
  - Requires middleware like `express.json()` on the server side to parse JSON bodies.
  - Requires client-side libraries like Axios or Fetch API to send the body data.

Using query parameters and request bodies appropriately ensures that your application handles data efficiently and securely.

## Project Walkthrough: `6.0 DIY API` (Joke API)

The `6.0 DIY API` folder contains the fullest example in this section — a
complete CRUD REST API for managing an in-memory array of jokes
(`index.js`, ~738 lines including seed data; reference answer in
`solution.js`, which should not be modified). It demonstrates every major
REST concept covered above:

| Method | Route | What it does | req data used | Response |
|---|---|---|---|---|
| `GET` | `/random` | Picks a random index into the `jokes` array and returns that joke | none | `200` + joke JSON |
| `GET` | `/jokes/:id` | Finds the joke whose `id` matches the route param | `req.params.id` | `200` + joke JSON (or `undefined` if not found — see note below) |
| `GET` | `/filter` | Filters jokes by `jokeType` | `req.query.type` | `200` + array of matching jokes |
| `POST` | `/jokes` | Creates a new joke and appends it to the array | `req.body.text`, `req.body.type` | `200` + created joke JSON |
| `PUT` | `/jokes/:id` | Replaces the entire joke at the given id | `req.params.id`, `req.body.text`, `req.body.type` | `200` + replacement joke JSON |
| `PATCH` | `/jokes/:id` | Updates only the supplied fields, falling back to existing values otherwise | `req.params.id`, `req.body.text`/`req.body.type` (optional) | `200` + updated joke JSON |
| `DELETE` | `/jokes/:id` | Removes the joke at the given id | `req.params.id` | `200` on success, `404` + error JSON if not found |
| `DELETE` | `/all` | Wipes the entire `jokes` array, but only if a valid master key is supplied | `req.query.key` | `200` on success, `404` + error JSON if the key is wrong |

Key implementation details:

- **In-memory data store** — `jokes` is a plain JavaScript array declared
  with `var` at the bottom of the file. There is no database; every
  route mutates this array directly, and all data resets when the server
  restarts.
- **Route parameters vs. query parameters** — routes like `/jokes/:id` use
  a *route parameter* (`req.params.id`) to identify a single resource,
  while `/filter?type=pun` uses a *query parameter* (`req.query.type`) to
  filter a collection.
- **`req.params.id` is always a string** — that's why the handlers call
  `parseInt(req.params.id)` before comparing it to the numeric `id` field
  stored on each joke object.
- **Middleware** — `body-parser`'s `urlencoded` middleware is registered
  once with `app.use(...)` before any routes, so `req.body` is populated
  for every POST/PUT/PATCH request.
- **Note on the `GET /jokes/:id` and `POST /jokes` responses:** the
  practice `index.js` in this project intentionally leaves some
  responses at their simplest form (e.g. always `200`, no `404` for a
  missing joke by id) as a learning exercise — compare against
  `solution.js` and the cheat sheet below to see the more complete,
  production-style version of each route (validating input, returning
  `404`/`201` where appropriate, etc.).

The **`Practice`** and **`Section Challenge Project`** folders follow a
slightly different structure aimed at simulating a more realistic setup:

- `index.js` (port `4000`) — the actual REST API for a `posts` resource
  (`GET /posts`, `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`,
  `DELETE /posts/:id`), backed by an in-memory `posts` array.
- `server.js` (port `3000`) — a separate front-end/client Express server
  that renders EJS views and talks to the API in `index.js` over HTTP
  using `axios`, mirroring how a real browser-facing web app would
  consume a backend API as two independently running processes.
- `solution.js` — the reference/completed version of `index.js` (do not
  modify).

## Express REST API Cheat Sheet

A minimal, from-scratch template for a CRUD REST API over a single
resource (`items`) using Express and an in-memory array.

### 1. Setup & JSON middleware

```js
import express from "express";

const app = express();
const port = 3000;

// Parses incoming JSON request bodies into req.body.
// Must be registered BEFORE your routes so req.body is populated.
app.use(express.json());

// In-memory "database"
let items = [];
let nextId = 1;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

> If you need to support traditional HTML `<form>` submissions instead of
> (or in addition to) JSON bodies, also add
> `app.use(express.urlencoded({ extended: true }));` (or the equivalent
> `body-parser` middleware: `bodyParser.json()` /
> `bodyParser.urlencoded({ extended: true })`).

### 2. GET all (read the whole collection)

```js
app.get("/items", (req, res) => {
  res.status(200).json(items);
});
```

### 3. GET by id (read a single resource)

```js
app.get("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: `Item with id ${id} not found.` });
  }

  res.status(200).json(item);
});
```

### 4. POST (create a resource)

```js
app.post("/items", (req, res) => {
  const newItem = {
    id: nextId++,
    name: req.body.name,
    // ...other fields from req.body
  };

  items.push(newItem);
  res.status(201).json(newItem); // 201 Created: a new resource now exists
});
```

### 5. PUT (fully replace a resource)

```js
app.put("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Item with id ${id} not found.` });
  }

  // PUT replaces the ENTIRE resource with the new body
  const replacement = { id, ...req.body };
  items[index] = replacement;

  res.status(200).json(replacement);
});
```

### 6. PATCH (partially update a resource)

```js
app.patch("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = items.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: `Item with id ${id} not found.` });
  }

  // PATCH only overwrites fields that were actually provided
  if (req.body.name !== undefined) item.name = req.body.name;
  // ...repeat for other optional fields

  res.status(200).json(item);
});
```

### 7. DELETE (remove a resource)

```js
app.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = items.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Item with id ${id} not found.` });
  }

  items.splice(index, 1);
  res.sendStatus(204); // 204 No Content: success, nothing to return
});
```

### Common HTTP Status Codes

| Code | Name | When to use it |
|---|---|---|
| `200` | OK | The request succeeded (typical default for `GET`, `PUT`, `PATCH`, and some `DELETE` responses that return a body). |
| `201` | Created | A `POST` request successfully created a new resource. Convention: return the created resource in the body. |
| `204` | No Content | The request succeeded but there is nothing to send back (common for `DELETE`, or updates where you don't return the resource). |
| `400` | Bad Request | The client sent invalid/malformed data (e.g. missing required fields, wrong data types) — validate `req.body`/`req.params`/`req.query` and return this before touching the data store. |
| `404` | Not Found | The requested resource (e.g. `/items/:id`) does not exist — used throughout the DIY API and challenge project whenever `find`/`findIndex` comes back empty. |
| `500` | Internal Server Error | Something unexpected failed on the server (e.g. a thrown exception, a failed call to another service) — used in `server.js`'s `try/catch` blocks when the `axios` call to the backend API fails. |

### Quick reference: matching HTTP verbs to actions

| Verb | Typical path | Action |
|---|---|---|
| `GET` | `/items` | Read all |
| `GET` | `/items/:id` | Read one |
| `POST` | `/items` | Create |
| `PUT` | `/items/:id` | Replace (full update) |
| `PATCH` | `/items/:id` | Update (partial update) |
| `DELETE` | `/items/:id` | Delete |
