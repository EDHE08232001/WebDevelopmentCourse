# Section 25 — EJS Templating with Express

This section introduces **EJS (Embedded JavaScript templating)**, a view engine used with Express to generate dynamic HTML on the server. Each subfolder below is a small, self-contained Express app (its own `package.json`, `index.js` starter file, `solution.js` reference answer, and a `views/` folder of `.ejs` templates) that builds on the previous one.

## Table of Contents

- [What is EJS and why use it?](#what-is-ejs-and-why-use-it)
- [How the folders are organized](#how-the-folders-are-organized)
- [4.0 EJS — Introduction](#40-ejs--introduction)
- [4.1 EJS Tags](#41-ejs-tags)
- [4.2 Passing Data to EJS Templates](#42-passing-data-to-ejs-templates)
- [4.3 EJS Partials](#43-ejs-partials)
- [4.4 Band Generator Project (Capstone)](#44-band-generator-project-capstone)
- [Cheat Sheet](#cheat-sheet)

---

## What is EJS and why use it?

**EJS** stands for **Embedded JavaScript**. It's a *templating language* / *view engine* that lets you write plain HTML with small snippets of JavaScript embedded directly inside it, wrapped in special tags like `<%= %>`. When a route handler calls `res.render()`, Express hands the template file to EJS, which executes the embedded JavaScript, substitutes in any data that was passed to it, and produces a final HTML string that gets sent to the browser.

This is called **server-side rendering (SSR)**: instead of sending a static HTML file, the server builds a *custom* HTML page for each request — for example, showing a logged-in user's name, a list of items pulled from a form submission, or a randomly generated result.

**Why use EJS with Express specifically?**

- It uses **plain HTML syntax**, so there's very little new syntax to learn beyond the EJS tags themselves (unlike some templating languages that invent their own markup).
- It supports **full JavaScript** inside `<% %>` tags — loops, conditionals, function calls — so you can reuse the same logic you already know.
- Express has **first-class support** for it: just set the view engine and drop `.ejs` files into a `views/` folder, and `res.render("file.ejs", data)` handles the rest.
- It supports **partials** (reusable template fragments like headers/footers), which keeps multi-page sites DRY (Don't Repeat Yourself).

---

## How the folders are organized

Each numbered folder is an independent mini Express project:

```
4.X Some Topic/
├── index.js          # Starter file — YOU write/complete the code here
├── solution.js        # Reference solution — read-only, don't edit
├── package.json        # Declares dependencies (express, ejs, body-parser, etc.)
└── views/
    ├── index.ejs        # Template(s) rendered by the routes
    └── partials/        # (in later sections) reusable header/footer fragments
```

To run any subfolder's app:

```bash
cd "4.X Some Topic"
npm install
node index.js
# then visit http://localhost:3000 in your browser
```

---

## 4.0 EJS — Introduction

**Folder:** `4.0 EJS/` (only contains `solution.js` — there is no starter `index.js` for this lesson; it's a short intro/demo).

This is the very first taste of EJS: setting up Express to use EJS as its view engine and rendering a single template. Key idea introduced here:

- Installing the `ejs` npm package makes Express automatically recognize and render `.ejs` files placed in the `views/` folder — no extra `app.set("view engine", "ejs")` call is even required, though it's often added explicitly for clarity in later projects.
- `res.render("solution.ejs")` looks for `views/solution.ejs`, executes it, and returns the resulting HTML.

---

## 4.1 EJS Tags

**Folder:** `4.1 EJS Tags/`

This lesson is a **reference/demo of every core EJS tag type** using one route that passes a small data object to a template. Concepts covered:

| Concept | Where it's shown |
|---|---|
| Output a value as text (auto-escaped) | `<%= title %>`, `<%= seconds %>` |
| Run JavaScript logic without printing anything | `<% if (...) { %> ... <% } %>` |
| Loop over an array | `<% items.forEach((fruit) => { %> ... <% }); %>` |
| Output raw/unescaped HTML | `<%- htmlContent %>` |
| Include another template file (partial) | `<%- include("footer.ejs") %>` |

**Key concept:** the `data` object passed as the second argument to `res.render("index.ejs", data)` becomes a set of local variables inside the template — every key (`title`, `seconds`, `items`, `htmlContent`) is directly accessible with `<%= keyName %>` inside `index.ejs`.

---

## 4.2 Passing Data to EJS Templates

**Folder:** `4.2 Passing Data to EJS Template/`

This lesson focuses on **getting data *into* a template from a form submission**, and introduces `body-parser` middleware. Flow:

1. `GET /` renders a form (first name + last name inputs) with no data.
2. The form `POST`s to `/submit`.
3. `body-parser`'s `urlencoded()` middleware parses the submitted form fields into `req.body`.
4. The route handler computes the combined length of both names and exposes it to the template two different ways:
   - Via **`res.locals.numberOfLetters = ...`** — properties set on `res.locals` become automatically available inside whichever view is rendered next in that request, without needing to be manually listed as a second argument.
   - Or (commented out alternative) by passing a plain object directly: `res.render("index.ejs", { numberOfLetters: numLetters })`.
5. The template uses `locals.numberOfLetters` in a conditional to decide whether to show the result or the initial prompt — this defensive check (`if (locals.numberOfLetters)`) avoids a runtime error on the very first page load, when that variable hasn't been set yet.

**Key concept:** there are two interchangeable ways to pass data to `res.render()` — an explicit data object argument, or setting properties on `res.locals` beforehand.

---

## 4.3 EJS Partials

**Folder:** `4.3 EJS Partials/`

This lesson introduces **partials**: reusable snippets of a template (typically a header and footer) that are shared across multiple pages, so you don't have to repeat the same `<head>`, navigation bar, or footer markup in every `.ejs` file.

The exercise builds a tiny 3-page site (Home, About, Contact) and teaches:

- **`express.static("./public")`** — a middleware that serves files in the `public/` folder (CSS, images) directly to the browser by URL path, e.g. a file at `public/styles/content.css` becomes reachable at `/styles/content.css`.
- **Adding routes** for each page (`/`, `/about`, `/contact`), each rendering its own `.ejs` file.
- **Including partials** with `<%- include("partials/header.ejs") %>` and `<%- include("partials/footer.ejs") %>` inside each page template, so the header/nav and footer appear consistently on every page while being defined only once.
- Because `include()` inserts raw HTML, it must use the **unescaped** output tag `<%- %>`, not `<%= %>` (which would escape the HTML tags into visible text like `&lt;header&gt;`).

**Key concept:** partials let you follow the DRY principle in server-rendered multi-page sites — update the header/footer once, and every page that includes it updates automatically.

---

## 4.4 Band Generator Project (Capstone)

**Folder:** `4.4 Band Generator Project/`

This is the **capstone practice project** for the section, combining everything learned so far:

- `express.static("public")` to serve the page's CSS.
- `body-parser` middleware (consistent setup pattern, even though this form doesn't submit extra text fields).
- A `GET /` route that renders the initial page with a "Generate Name" button.
- A `POST /submit` route that:
  1. Picks a **random adjective** from a large `adj` array and a **random noun** from a large `noun` array (each array contains hundreds of words).
  2. Uses the classic random-array-index pattern: `array[Math.floor(Math.random() * array.length)]`.
  3. Re-renders the page, passing the two chosen words so the template can display a generated band name (e.g. "The Adorable Aardvark").
- Partials are used again here (`views/partials/header.ejs`, `views/partials/footer.ejs`) for consistent layout.

**Key concept:** this project reinforces route handling, template data-passing, static file serving, and partials — all wrapped around a fun bit of "business logic" (random name generation) to tie the concepts together.

> **Note:** the `index.js` file in this folder is unusually long (~5,700 lines) because the `adj` and `noun` word lists are large static arrays. The actual application logic (imports, middleware, and the two routes) is all near the top of the file — the arrays themselves are just data, not logic.

---

## Cheat Sheet

### EJS Tag Reference

| Tag | Name | Behavior |
|---|---|---|
| `<%= value %>` | Output (escaped) | Prints the value as HTML-escaped text. Safe default for untrusted/user data — prevents HTML/JS injection. |
| `<% code %>` | Scriptlet | Executes JavaScript without printing anything. Used for `if`/`else`, loops (`forEach`, `for`), and variable declarations. |
| `<%- value %>` | Output (unescaped) | Prints the value as **raw HTML**, without escaping. Use for trusted HTML content or when including partials. |
| `<%# comment %>` | Comment | Not rendered or executed at all — purely a comment inside the template, invisible in the final HTML output. |
| `<%- include("file.ejs") %>` | Include / partial | Inserts another `.ejs` file's rendered output at this point. Must use `<%- %>` (unescaped) since it's inserting HTML. |
| `<%% %>` | Literal | Outputs a literal `<%` or `%>` character sequence, escaping the normal tag syntax. |

### Common Express + EJS Setup

```js
import express from "express";

const app = express();
const port = 3000;

// EJS is used automatically for .ejs files in the "views" folder once the
// "ejs" package is installed — but it's good practice to be explicit:
app.set("view engine", "ejs");

// Serve static assets (CSS, images, client JS) from "public/"
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", { title: "My Page" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### body-parser Usage (reading form data)

```js
import bodyParser from "body-parser";

// Parses HTML form submissions (application/x-www-form-urlencoded)
// into a plain JS object available on req.body
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/submit", (req, res) => {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  res.render("index.ejs", { firstName, lastName });
});
```

### Rendering a Partial

```ejs
<!-- views/index.ejs -->
<%- include("partials/header.ejs") %>

<main>
  <h1><%= title %></h1>
</main>

<%- include("partials/footer.ejs") %>
```

### Looping and Conditionals in a Template

```ejs
<% if (items.length > 0) { %>
  <ul>
    <% items.forEach((item) => { %>
      <li><%= item %></li>
    <% }); %>
  </ul>
<% } else { %>
  <p>No items to display.</p>
<% } %>
```
