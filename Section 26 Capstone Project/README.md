# Section 26 Capstone Project — Blog App (In-Memory CRUD-lite)

A minimal blog application built with **Node.js**, **Express**, and **EJS**.
Users can create new posts through a form and delete existing posts. All
posts are stored in a plain in-memory JavaScript array — there is no
database — which makes this project ideal for practicing core Express
concepts without the overhead of setting up persistence.

## How the app works

1. The server starts and initializes an empty array, `posts = []`.
2. Visiting `GET /` renders `views/index.ejs`, looping over `posts` to
   display each one.
3. Submitting the "new post" form sends a `POST /create-post` request. The
   server reads the submitted text from `req.body.post` (thanks to
   `body-parser`) and pushes it onto the `posts` array.
4. Clicking "delete" on a post sends a `GET /delete-post?postIndex=N` request.
   The server parses `N` into an integer, validates it's a real index within
   bounds, and removes that post with `Array.prototype.splice`.
5. Because `posts` lives only in server memory, **restarting the server
   resets it back to an empty array** — all posts are lost. This is the
   classic tradeoff of in-memory storage vs. a real database (MongoDB,
   PostgreSQL, etc.), and is a deliberate simplification for this exercise.

## Core concepts covered

| Concept | Where it shows up |
|---|---|
| Express routing (`GET`/`POST`) | `app.get("/")`, `app.post("/create-post")`, `app.get("/delete-post")` |
| `body-parser` for form submissions | `app.use(bodyParser.urlencoded({ extended: true }))`, reading `req.body.post` |
| EJS rendering with dynamic data | `res.render("index.ejs", { posts })`, looping over `posts` in the template |
| Array manipulation (`splice`) | `posts.splice(postIndex, 1)` in the delete route |
| Static file serving | `app.use(express.static("./public"))` for CSS/JS assets |
| Query string parsing | `req.query.postIndex` + `parseInt` + bounds checking |

## Why in-memory storage matters (and its limits)

Storing data in a plain array is simple and great for learning, but it comes
with real limitations every developer should recognize:

- **Not persistent** — a server crash, redeploy, or manual restart wipes all data.
- **Not shared** — if you ran multiple server instances (e.g. behind a load
  balancer), each would have its own separate `posts` array.
- **Not safe under concurrency** — simultaneous requests mutating the same
  array can cause race conditions in more complex scenarios.

A production blog app would instead read/write posts to a database.

---

## Cheat Sheet

### 1. Setting up Express + body-parser

```js
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Serve static files (CSS, JS, images) from the "public" folder
app.use(express.static("./public"));

// Parse HTML form submissions (application/x-www-form-urlencoded)
// so they're available on req.body
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`App is up at port ${port}`);
});
```

> Note: Modern Express (4.16+) also ships a built-in equivalent,
> `express.urlencoded({ extended: true })`, so `body-parser` is no longer
> strictly required — but it's still commonly taught/used and works the same way.

### 2. A POST route that reads `req.body`

```js
app.post("/create-post", (req, res) => {
  const post = req.body.post; // must match the form field's `name="post"`
  if (post) {
    posts.push(post);
  }
  res.redirect("/");
});
```

Corresponding HTML form (in the EJS view):

```html
<form action="/create-post" method="POST">
  <input type="text" name="post" placeholder="What's on your mind?" />
  <button type="submit">Post</button>
</form>
```

### 3. A GET route that reads `req.query`

```js
// URL looks like: /delete-post?postIndex=2
app.get("/delete-post", (req, res) => {
  const postIndex = parseInt(req.query.postIndex); // query values are always strings!
  if (postIndex >= 0 && postIndex < posts.length) {
    posts.splice(postIndex, 1);
  }
  res.redirect("/");
});
```

Key takeaway: `req.query` values are **always strings**, so numeric query
params must be converted with `parseInt` (or `Number()`) before being used
as array indices or in numeric comparisons.

### 4. Array `splice` usage for deletion

```js
// Array.prototype.splice(startIndex, deleteCount)
const posts = ["first", "second", "third"];

posts.splice(1, 1); // removes 1 element starting at index 1 ("second")
// posts is now ["first", "third"]
```

`splice` mutates the array in place and returns the removed elements. This
is the standard way to remove an item from an array by index in JavaScript
(as opposed to `filter`, which creates a new array and doesn't mutate).

### 5. Bounds-checking pattern (defensive coding)

```js
const index = parseInt(req.query.postIndex);

// Guards against: NaN (invalid input), negative numbers, and out-of-range values
if (index >= 0 && index < posts.length) {
  posts.splice(index, 1);
}
```

If `index` is `NaN` (e.g. missing/invalid query param), both comparisons
evaluate to `false`, so the `if` block is safely skipped — no crash, no
incorrect deletion.

---

## Files in this project

- `index.js` — Express server, routes, and in-memory `posts` array (see inline comments).
- `views/index.ejs` — Main page template that lists posts and includes the "new post" form.
- `views/partials/header.ejs`, `views/partials/footer.ejs` — Shared layout partials.
- `public/styles/style.css` — Page styling.
- `public/javascript/modalForm.js` — Client-side script (e.g. for a modal "new post" form).
