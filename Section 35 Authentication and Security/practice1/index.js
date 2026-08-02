// PRACTICE 1: Basic registration/login using a raw PostgreSQL "users" table.
// This is the FIRST step in the authentication progression for this section:
// it intentionally stores passwords in PLAINTEXT so later practices (2-5) can
// show why that is dangerous and how to fix it with hashing, sessions, and env vars.
import express from "express"; // Web framework used to define routes/middleware
import bodyParser from "body-parser"; // Parses HTML form submissions into req.body
import pg from "pg"; // PostgreSQL driver - lets us run SQL queries from Node

const app = express();
const port = 3000;

// SECURITY WARNING: Hardcoded database credentials.
// "edwardhe" / "edward0823" are real-looking credentials committed directly in
// source code. Anyone with access to this repo (or its git history) can read
// them. In a real project these should NEVER be hardcoded - instead load them
// from environment variables (e.g. via a .env file + the `dotenv` package, as
// shown starting in practice4/index.js: process.env.PG_USER, process.env.PG_PASSWORD, etc.)
// and add .env to .gitignore. If this password were ever real/live, it should
// now be treated as compromised and rotated immediately.
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "secrets",
  password: "edward0823",
  port: 5432,
});

db.connect(); // Opens the connection to Postgres (fire-and-forget here, no error handling)

// Middleware setup:
// - bodyParser.urlencoded lets us read fields from HTML <form> POST bodies (req.body.username, req.body.password)
// - express.static serves files from ./public (e.g. CSS) directly to the browser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET / - renders the public home page (no auth required)
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// GET /login - renders the login form (no auth required)
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// GET /register - renders the registration form (no auth required)
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// POST /register - creates a new user account.
// Flow: check if the email is already taken -> if not, insert a new row.
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    // BUG + SECURITY NOTE: this query references "$1" as a placeholder but never
    // passes the `[email]` parameter array, so it will not actually filter by
    // email (it will error or behave unexpectedly at runtime). Compare with
    // practice2/index.js, which correctly passes `[email]` as the second argument.
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1;");

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      // SECURITY WARNING - PLAINTEXT PASSWORD STORAGE:
      // The raw, human-readable password from the registration form is inserted
      // directly into the database with no hashing/encryption at all. If the
      // database were ever leaked or accessed by an attacker (or a curious
      // employee), every user's real password would be exposed immediately -
      // and because many people reuse passwords, this can compromise their
      // accounts on other sites too.
      // FIX: hash the password before storing it, e.g. with bcrypt:
      //   const hash = await bcrypt.hash(password, saltRounds);
      //   INSERT INTO users (email, password) VALUES ($1, $2) -- store `hash`, not `password`
      // See practice2/index.js for the corrected version of this exact flow.
      const result = await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2);",
        [email, password]
      );

      console.log(result);
      res.render("secrets.ejs"); // No real access control here - anyone who registers/logs in sees the same protected-looking page
    }
  } catch (err) {
    console.log(err);
  }
});

// POST /login - authenticates an existing user by comparing plaintext passwords.
app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1;",
      [email]
    );

    if (result.rows.length > 0) {
      console.log(result.rows);
      const user = result.rows[0];
      const storedPassword = user.password;

      // SECURITY WARNING - PLAINTEXT PASSWORD COMPARISON:
      // This directly compares the submitted password to the stored password
      // using `===`. This only "works" because the password was stored in
      // plaintext during registration above. A production app must never do
      // this; instead store a bcrypt hash and use `bcrypt.compare(password,
      // storedHashedPassword, callback)` to verify it without ever storing or
      // comparing raw passwords. See practice2/index.js for the secure version.
      if (password === storedPassword) {
        res.render("secrets.ejs"); // "Logged in" - but note: no session is created, so this access is not remembered on future requests
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
