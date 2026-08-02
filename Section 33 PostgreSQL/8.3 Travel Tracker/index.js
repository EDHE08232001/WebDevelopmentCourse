import express from "express"; // Web framework used to define routes (GET/POST) and render views
import bodyParser from "body-parser"; // Parses incoming form data (application/x-www-form-urlencoded) into req.body
import pg from "pg"; // node-postgres: the driver used to talk to our PostgreSQL database

// pg.Client opens ONE persistent connection to Postgres for the lifetime of
// this process. Every query below (checkVisisted, the "/" route, and the
// "/add" route) reuses this same connection/client instance.
// For apps that need to handle many concurrent requests, `pg.Pool` is usually
// preferred over `pg.Client` because it hands out/recycles multiple
// connections instead of serializing all queries through a single one.
//
// !!! SECURITY WARNING !!!
// `user` and `password` below are a real-looking, hardcoded database
// credential pair committed straight into source control. Never do this in
// real projects — anyone who can read this file (or the git history) can
// connect to the database. Treat this password as COMPROMISED since it has
// already been committed, and rotate it on the actual database.
// Instead, load these values from environment variables via a `.env` file +
// the `dotenv` package (and make sure `.env` is listed in `.gitignore`):
//   import dotenv from "dotenv";
//   dotenv.config();
//   const db = new pg.Client({
//     user: process.env.PGUSER,
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     password: process.env.PGPASSWORD,
//     port: process.env.PGPORT,
//   });
// The values below are left unchanged intentionally (course/demo code).
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "world_demo",
  password: "your_postgres_password",
  port: "5432",
});

db.connect(); // Opens the actual TCP connection to PostgreSQL described above.
// Must happen before any db.query() calls succeed.

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper that fetches the list of country codes the user has already
// visited. SQL: "SELECT country_code FROM visited_countries" -> selects just
// the country_code column from every row in the visited_countries table (no
// WHERE clause, so it returns ALL visited countries — this earlier version
// of the app doesn't yet support multiple users, unlike the Family Travel
// Tracker version).
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  // result.rows is an array of row objects, e.g. [{ country_code: 'FR' }, ...].
  // We pull out just the country_code string from each row into a flat array.
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  return countries;
}

// GET "/" - renders the home page listing every country visited so far.
app.get("/", async (req, res) => {
  //Write your code here.
  // Same query as checkVisisted() above: get every visited country's code.
  // Using db.query with no parameters here is safe because the SQL string is
  // a fixed literal with no user input concatenated into it.
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(result.rows);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });
  db.end(); // Closes the database connection. NOTE: once this runs, the single
  // shared `db` Client is closed, so any subsequent query on this same
  // connection (e.g. another request) would fail — a good illustration of
  // why a real app should use a Pool or only call db.end() on shutdown.
});

// POST "/add" - handles the "add a visited country" form submission.
// This route performs two queries: first look up the country code by name,
// then insert that code into visited_countries.
app.post("/add", async (req, res) => {
  const input = req.body["country"]; // Raw user input typed into the form field

  try {
    /*
    SELECT country_code FROM countries: This part of the query selects the country_code column from the countries table.

    WHERE LOWER(country_name) LIKE '%' || $1 || '%':
      This part of the query filters the rows in the countries table based on a condition applied to the country_name column.
    
    LOWER(country_name): This function converts the country_name column value to lowercase.
    This ensures that the search is case-insensitive. For example, if the country_name is "Canada",
    it will be converted to "canada".
    */
    // PARAMETERIZED QUERY: the `$1` placeholder is substituted with the value
    // from the `[input]` array by the pg driver itself (not by string
    // concatenation). This is important because `input` comes directly from
    // user-submitted form data (req.body) — if it were inserted into the SQL
    // string directly (e.g. via template literals), a malicious user could
    // inject their own SQL. Using $1 + a values array means the database
    // always treats `input` as a plain data value, never as executable SQL,
    // which is what prevents SQL injection here.
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  '%' || $1 || '%';",
      [input]
    );

    const data = result.rows[0]; // First (and expected only) matching row
    const countryCode = data.country_code;

    try {
      // SQL: INSERT a new row into visited_countries with the country_code we
      // just looked up. Again parameterized via $1 to safely pass `countryCode`
      // as data rather than raw SQL text.
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      // Most likely cause: the country_code already exists and violates the
      // UNIQUE constraint on visited_countries.country_code (see queries.sql /
      // README), i.e. the country was already marked as visited.
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try adding a different country",
      });
    }
  } catch (err) {
    // This catch fires if `data` is undefined, i.e. the SELECT above found no
    // matching country name in the `countries` table.
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again",
    });
  }
});

// Start the Express server listening on port 3000.
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
