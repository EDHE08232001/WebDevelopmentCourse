# Section 33: Using PostgreSQL with Node.js

## Introduction

PostgreSQL is a powerful, open-source relational database system. Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Combining these two technologies allows you to build scalable, high-performance applications. In this section, we will learn how to connect to a PostgreSQL database from a Node.js application using the `pg` library.

This section contains four independent Express + PostgreSQL demo apps (each with its own `package.json`, so each needs its own `npm install`):

| Folder | Demonstrates |
| --- | --- |
| [`8.2 Postgres Read`](./8.2%20Postgres%20Read/index.js) | Basic read-only queries: loading rows from Postgres at startup and rendering them |
| [`8.3 Travel Tracker`](./8.3%20Travel%20Tracker/index.js) | Full CRUD-style flow: `SELECT`, parameterized `INSERT`, and using query results to drive the UI |
| [`8.5 Family Travel Tracker`](./8.5%20Family%20Travel%20Tracker/index.js) | Multi-user data model with a `JOIN`, per-user filtering with `WHERE`, and `INSERT ... RETURNING` |
| [`World+Capital+Quiz`](./World+Capital+Quiz/index.js) | Loading quiz content from Postgres once at startup and serving it from memory |

See the ["What Each Subproject Demonstrates"](#what-each-subproject-demonstrates) section below for a full walkthrough of each app's routes and queries.

### Contents

- [Prerequisites](#prerequisites)
- [Setting Up PostgreSQL](#setting-up-postgresql)
- [Installing the pg Library](#installing-the-pg-library)
- [The `pg` Package: Client vs Pool](#the-pg-package-client-vs-pool)
- [Basic Usage](#basic-usage)
- [Explanation](#explanation)
- [More Examples](#more-examples)
- [Best Practices](#best-practices)
- [Parameterized Queries and SQL Injection Prevention](#parameterized-queries-and-sql-injection-prevention)
- [Security: Never Hardcode Database Credentials](#security-never-hardcode-database-credentials)
- [SQL Notes](#sql-notes)
- [What Each Subproject Demonstrates](#what-each-subproject-demonstrates)
- [Cheat Sheet: Ready-to-Copy `pg` Snippets](#cheat-sheet-ready-to-copy-pg-snippets)
- [Conclusion](#conclusion)

## Prerequisites

Before you begin, make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- npm (comes with Node.js)

## Setting Up PostgreSQL

Ensure PostgreSQL is running and you have a database set up. You can use the following commands to start PostgreSQL and create a database:

```sh
# Start PostgreSQL
sudo service postgresql start

# Create a new database
sudo -u postgres createdb mydatabase

# Create a new user (replace 'username' and 'password' with your credentials)
sudo -u postgres createuser --interactive

# After running your code or application, close the database (optional and only if you want to stop the server)
sudo service postgresql stop
```

## Installing the pg Library

To interact with PostgreSQL from Node.js, we use the `pg` library. Install it using npm:

```sh
npm install pg
```

## The `pg` Package: Client vs Pool

The `pg` npm package ("node-postgres") is the standard driver for talking to PostgreSQL from Node.js/Express. It exposes two main ways to connect:

| | `pg.Client` | `pg.Pool` |
| --- | --- | --- |
| What it is | A single, dedicated connection to the database | A managed pool of multiple reusable connections |
| Best for | Scripts, tutorials, one-off queries | Express apps serving many concurrent requests |
| Concurrency | Queries on the same client run one at a time (queued) | Multiple queries can run at the same time on different pooled connections |
| Typical lifecycle | `connect()` once, `end()` when fully done | Created once; you `.query()` directly on the pool and it borrows/returns a connection automatically |

Every `index.js` in this section's subprojects uses `pg.Client` (via `new pg.Client({...})` and `db.connect()`), which is appropriate for these small demo apps that mostly run one query at a time. In a real production Express app that needs to handle many simultaneous users, you'd usually reach for `pg.Pool` instead:

```js
import pg from "pg";

const pool = new pg.Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// No explicit .connect() needed — the pool grabs a connection when you query
const result = await pool.query("SELECT * FROM users");
console.log(result.rows);
```

## Basic Usage

Here is a basic example to connect to a PostgreSQL database and execute a simple query.

```javascript
import { Client } from "pg";

// Configuration object for database connection
const db = new Client({
    user: "username",
    host: "localhost",
    database: "mydatabase",
    password: "password",
    port: 5432,
});

// Connect to the database
db.connect();

// Execute a query
db.query("SELECT * FROM users", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        console.log("User Data: ", res.rows);
    }

    // Close the connection
    db.end();
});
```

## Explanation

- **Importing the Client**: We import the `Client` class from the `pg` library to create a new client instance for our database connection.
- **Database Configuration**: We configure the database connection by specifying the user, host, database name, password, and port.
- **Connecting to the Database**: We call the `connect` method to establish a connection to the database.
- **Executing a Query**: We use the `query` method to execute a SQL query. The callback function handles the response or any errors that occur.
- **Closing the Connection**: We call the `end` method to close the connection to the database.

## More Examples

### Inserting Data

Let's insert a new user into the `users` table.

```javascript
db.connect();

const text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *';
const values = ['John Doe', 'john.doe@example.com'];

db.query(text, values, (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        console.log("Inserted User: ", res.rows[0]);
    }

    db.end();
});
```

### Updating Data

Now, let's update a user's email based on their name.

```javascript
db.connect();

const text = 'UPDATE users SET email = $1 WHERE name = $2 RETURNING *';
const values = ['john.updated@example.com', 'John Doe'];

db.query(text, values, (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        console.log("Updated User: ", res.rows[0]);
    }

    db.end();
});
```

### Deleting Data

Finally, let's delete a user from the `users` table.

```javascript
db.connect();

const text = 'DELETE FROM users WHERE name = $1 RETURNING *';
const values = ['John Doe'];

db.query(text, values, (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        console.log("Deleted User: ", res.rows[0]);
    }

    db.end();
});
```

## Best Practices

- **Parameterization**: Always use parameterized queries (as shown in the examples) to avoid SQL injection attacks.
- **Connection Pooling**: For better performance, especially in production environments, consider using a connection pool to manage multiple database connections efficiently.

## Parameterized Queries and SQL Injection Prevention

A **parameterized query** (also called a *prepared statement*) uses numbered placeholders — `$1`, `$2`, `$3`, ... — in the SQL string instead of directly embedding values. The actual values are passed separately, as an array, as the second argument to `.query()`. The `pg` driver sends the SQL text and the values to PostgreSQL **separately**, so PostgreSQL always treats the placeholder values as pure data, never as executable SQL syntax.

This matters because a lot of user input in these apps — country names typed into a form, quiz answers, new user names — comes straight from `req.body`. If that input were concatenated directly into a SQL string, a malicious user could type something like `'; DROP TABLE users; --` into a form field and potentially run their own SQL against your database. This class of attack is called **SQL injection**.

```js
// ❌ UNSAFE — string concatenation lets user input change the SQL itself
const input = req.body.country; // e.g. a malicious user submits: ' OR '1'='1
await db.query(
  `SELECT country_code FROM countries WHERE country_name = '${input}'`
);

// ✅ SAFE — parameterized query: $1 is always treated as a plain data value
const input = req.body.country;
await db.query(
  "SELECT country_code FROM countries WHERE country_name = $1",
  [input]
);
```

You'll see this pattern throughout the subprojects in this section, for example in `8.3 Travel Tracker/index.js`:

```js
const result = await db.query(
  "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
  [input]
);

await db.query(
  "INSERT INTO visited_countries (country_code) VALUES ($1)",
  [countryCode]
);
```

and in `8.5 Family Travel Tracker/index.js`, where two placeholders are used together:

```js
await db.query(
  "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
  [countryCode, currentUserId]
);
```

**Rule of thumb:** if a value in your SQL query ever comes from user input (a form field, a URL parameter, a header, etc.), it belongs in the values array behind a `$n` placeholder — never directly inside the SQL string via concatenation or template literals.

## Security: Never Hardcode Database Credentials

All four `index.js` files in this section currently create their `pg.Client` like this:

```js
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "world_demo",
  password: "your_postgres_password", // ⚠️ hardcoded real-looking password
  port: 5432,
});
```

This is convenient for a local tutorial, but it is **not safe for real projects**:

- Anyone with read access to the repository (including its git history, forks, and backups) can read the username and password in plain text.
- If this code is ever pushed to a public or shared repository, the credentials should be considered **compromised** and rotated/changed on the actual database immediately, even after removing them from the code, because git history still retains old commits.
- Hardcoded credentials also make it harder to use different databases for development, testing, and production.

### The fix: environment variables with `.env` + `dotenv`

1. Install `dotenv`:

   ```sh
   npm install dotenv
   ```

2. Create a `.env` file in the project root (never commit this file):

   ```
   PGUSER=edwardhe
   PGHOST=localhost
   PGDATABASE=world_demo
   PGPASSWORD=your_postgres_password
   PGPORT=5432
   ```

3. Add `.env` to `.gitignore` so it never gets committed:

   ```
   node_modules/
   .env
   ```

4. Load the variables at the top of `index.js` and read them via `process.env`:

   ```js
   import dotenv from "dotenv";
   dotenv.config();

   import pg from "pg";

   const db = new pg.Client({
     user: process.env.PGUSER,
     host: process.env.PGHOST,
     database: process.env.PGDATABASE,
     password: process.env.PGPASSWORD,
     port: process.env.PGPORT,
   });
   ```

> **Note:** the demo code in this section's `index.js` files still has the credentials hardcoded intentionally, with warning comments added directly above each connection config pointing back to this section. The values themselves were left unchanged so the tutorial code keeps working as originally written — but if this were a real project, that password should be rotated immediately.

## SQL Notes

### UNIQUE and NOT NULL

```sql
CREATE TABLE visited_countries (
	id SERIAL PRIMARY KEY,
	country_code CHAR(2) NOT NULL UNIQUE -- can't be empry and can't be repeated
);
```

### READ and SORT

```sql
-- This is an example query
SELECT * FROM public.visited_countries ORDER BY id ASC;
```

This clause is used to sort the result set by one or more columns. In this case, the results will be sorted by the id column in ascending order (ASC stands for ascending). Sorting in ascending order means the smallest values will come first, followed by larger values.

## What Each Subproject Demonstrates

Each folder below is a standalone Express app with its own `package.json`, `index.js`, and a matching `solution*.js` reference solution (not to be modified — they show one correct way to finish the exercise). Run `npm install` inside a given folder before starting it with `node index.js`, and make sure the matching PostgreSQL table(s) exist first.

### [`8.2 Postgres Read`](./8.2%20Postgres%20Read/index.js) — Flags Quiz (read-only)

- Connects with `pg.Client` and, once at startup, runs `SELECT * FROM flags` to load every row from the `flags` table into an in-memory `quiz` array.
- `GET /` picks a random question from that in-memory array and renders it — no database access happens per-request.
- `POST /submit` checks the submitted answer against the current question and tracks the running score, again entirely in memory.
- Demonstrates the simplest possible use of `pg`: one read at startup, no writes, no parameters.

### [`8.3 Travel Tracker`](./8.3%20Travel%20Tracker/index.js) — Countries Visited

- `GET /` runs `SELECT country_code FROM visited_countries` to list every country the user has marked as visited.
- `POST /add` runs two queries: a parameterized `SELECT ... WHERE LOWER(country_name) LIKE '%' || $1 || '%'` to look up a country code by name, then a parameterized `INSERT INTO visited_countries (country_code) VALUES ($1)` to record the visit.
- Demonstrates a full read + parameterized write flow, plus basic error handling for "country not found" and "country already added" (a `UNIQUE` constraint violation).
- `solution1.js` through `solution4.js` show incremental reference solutions for this exercise — useful for comparing different stages of the implementation.

### [`8.5 Family Travel Tracker`](./8.5%20Family%20Travel%20Tracker/index.js) — Multi-User Travel Tracker

- Extends the Travel Tracker concept to support multiple family members. The `users` table stores each family member (`id`, `name`, `color`), and `visited_countries` gets a `user_id` foreign key (see [`queries.sql`](./8.5%20Family%20Travel%20Tracker/queries.sql)).
- `checkVisisted()` uses a `JOIN` plus a parameterized `WHERE user_id = $1` to scope results to only the currently selected user: `SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1`.
- `POST /add` inserts with two placeholders: `INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)`.
- `POST /new` demonstrates `INSERT ... RETURNING *`, which returns the newly created row (including its auto-generated `id`) in the same query, so the new user can immediately become the "current user".
- Demonstrates modeling a one-to-many relationship (one user has many visited countries) and reading it back with a `JOIN`.

### [`World+Capital+Quiz`](./World+Capital+Quiz/index.js) — Capitals Quiz (read-only)

- Same shape as `8.2 Postgres Read`: connects with `pg.Client`, runs `SELECT * FROM capitals` once at startup to populate an in-memory `quiz` array (falling back to a small hardcoded array if the query hasn't resolved yet), then serves random country/capital questions from memory.
- Demonstrates using a database purely to seed application state, rather than querying on every request.

## Cheat Sheet: Ready-to-Copy `pg` Snippets

### Setup and connect (`pg.Client`)

```js
import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load variables from .env into process.env

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

db.connect(); // Open the connection before running any queries

const app = express();
app.listen(3000, () => console.log("Server running on port 3000"));
```

### Parameterized `SELECT`

```js
const result = await db.query(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);
console.log(result.rows); // Array of matching row objects
```

### Parameterized `INSERT`

```js
const result = await db.query(
  "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *",
  [name, color]
);
const newUser = result.rows[0]; // The row Postgres just created, including its id
```

### Parameterized `UPDATE`

```js
const result = await db.query(
  "UPDATE users SET color = $1 WHERE id = $2 RETURNING *",
  [newColor, userId]
);
const updatedUser = result.rows[0];
```

### Parameterized `DELETE`

```js
const result = await db.query(
  "DELETE FROM visited_countries WHERE id = $1 RETURNING *",
  [rowId]
);
const deletedRow = result.rows[0];
```

### Quick reference table

| Operation | SQL shape | Notes |
| --- | --- | --- |
| Read | `SELECT * FROM t WHERE col = $1` | `result.rows` is always an array, even for one row |
| Create | `INSERT INTO t (a, b) VALUES ($1, $2) RETURNING *` | `RETURNING *` avoids a second query to fetch the new row |
| Update | `UPDATE t SET a = $1 WHERE id = $2 RETURNING *` | Always scope updates with a `WHERE` clause using a parameter |
| Delete | `DELETE FROM t WHERE id = $1 RETURNING *` | Same rule: never delete without a parameterized `WHERE` |

## Conclusion

By following this guide, you should now be able to connect to a PostgreSQL database from a Node.js application and perform basic CRUD (Create, Read, Update, Delete) operations. Practice these examples and experiment with more complex queries to become proficient in using PostgreSQL with Node.js.

For more detail on raw `psql` commands and server administration, see [`PSQL_Commands.md`](./PSQL_Commands.md); for a deeper walkthrough of `pg` basics and SQL relationship modeling, see [`POSTGRES_TUTORIAL.md`](./POSTGRES_TUTORIAL.md).