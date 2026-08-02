import express from "express"; // Web framework: routing, middleware, view rendering
import bodyParser from "body-parser"; // Parses HTML form submissions into req.body
import pg from "pg"; // node-postgres driver used to query PostgreSQL

const app = express();
const port = 3000;

// pg.Client: a single, dedicated connection to Postgres shared by every
// route/helper in this file (checkVisisted, getCurrentUser, "/", "/add",
// "/user", "/new"). This app supports multiple family members/users, and
// every one of those queries reuses this same connection sequentially.
// A production app juggling many simultaneous users would typically use
// `pg.Pool` instead so multiple queries can run concurrently on separate
// pooled connections.
//
// !!! SECURITY WARNING !!!
// The `user` and `password` values below are a hardcoded, real-looking
// database credential pair checked into source control. This should never
// be done in real projects: anyone with read access to this file/repo (or
// its git history) can see the credentials and connect to the database.
// Because this password is already committed, treat it as COMPROMISED and
// rotate/change it on the actual database.
// Prefer loading these from environment variables via a `.env` file + the
// `dotenv` package (and add `.env` to `.gitignore` so it's never committed):
//   import dotenv from "dotenv";
//   dotenv.config();
//   const db = new pg.Client({
//     user: process.env.PGUSER,
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     password: process.env.PGPASSWORD,
//     port: process.env.PGPORT,
//   });
// Values below are left unchanged intentionally (course/demo code).
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "world_demo",
  password: "your_postgres_password",
  port: 5432,
});
db.connect(); // Opens the TCP connection to PostgreSQL using the config above.

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 22

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

// Returns the list of country codes visited by the CURRENTLY SELECTED family
// member only. SQL: joins visited_countries to users on users.id = user_id,
// then filters with WHERE user_id = $1 so only rows belonging to the current
// user are returned. This is the key difference from the plain Travel
// Tracker app: countries are now scoped per-user via the JOIN + WHERE.
// PARAMETERIZED QUERY: `$1` is bound to `currentUserId` via the second
// argument array. Even though currentUserId isn't raw user text input here,
// using $1 is still the safe, idiomatic pg pattern — it lets the driver handle
// escaping/typing instead of building the SQL string by hand, which is what
// protects against SQL injection whenever a value could contain untrusted
// input.
async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );
  let countries = [];
  // Flatten result.rows (array of { country_code: ... } objects) into a
  // simple array of country code strings for use in the view.
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// SQL: "SELECT * FROM users" -> fetches every column for every row in the
// users table (i.e. every family member). We refresh the module-level
// `users` array from the DB, then look up and return the user object whose
// id matches `currentUserId`.
async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows; // result.rows is an array of user row objects, e.g.
  // [{ id: 1, name: 'Angela', color: 'teal' }, ...]
  return users.find((user) => user.id == currentUserId);
}

// GET "/" - home page: shows the map/list of countries visited by the
// currently selected family member, plus the list of all users for the
// user-switcher UI.
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
// POST "/add" - adds a new visited country for the CURRENT user.
// Two queries run here: (1) look up the country's code from its name, then
// (2) insert a (country_code, user_id) row so the visit is tied to whichever
// family member is currently selected.
app.post("/add", async (req, res) => {
  const input = req.body["country"]; // Country name typed into the form
  const currentUser = await getCurrentUser();

  try {
    // PARAMETERIZED QUERY: $1 is safely bound to input.toLowerCase() via the
    // values array, so user-supplied text can never be interpreted as SQL
    // syntax (which is exactly what stops SQL injection attacks) — contrast
    // this with unsafely building a string like `... LIKE '%${input}%'`.
    // SQL meaning: find the country_code for any row in `countries` whose
    // lowercased country_name contains the search text.
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0]; // First matching country row (if any)
    const countryCode = data.country_code;
    try {
      // SQL: INSERT a new visited_countries row linking this country_code to
      // the current user's id. $1/$2 are parameter placeholders bound to
      // countryCode and currentUserId respectively — again avoiding any raw
      // string concatenation of values into the SQL text.
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      // Likely a duplicate visit (e.g. unique constraint) or invalid user_id;
      // logged but the response isn't customized further here.
      console.log(err);
    }
  } catch (err) {
    // Likely no matching country name found (data would be undefined above).
    console.log(err);
  }
});

// POST "/user" - handles the user-switcher form. Doesn't query the
// database: either shows the "add new family member" form, or just updates
// which user is "current" in memory (currentUserId) and redirects home.
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

// POST "/new" - creates a brand-new family member/user.
// SQL: INSERT a new row into `users` with the given name/color, and
// `RETURNING *` asks Postgres to hand back the full newly-inserted row
// (including its auto-generated `id`) in the same round trip, so we don't
// need a separate SELECT to find out what id was assigned.
// PARAMETERIZED QUERY: $1/$2 bind `name` and `color` (both user-supplied via
// the form) as data values rather than raw SQL text, which is what prevents
// SQL injection here.
app.post("/new", async (req, res) => {
  const name = req.body.name;
  const color = req.body.color;

  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id; // The id Postgres generated (SERIAL PRIMARY KEY)
  currentUserId = id; // Switch the app to treat the newly created user as current

  res.redirect("/");
});

// Start the Express server on port 3000.
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});