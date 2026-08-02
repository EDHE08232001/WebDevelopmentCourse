import express from "express"; // Web framework for routing + rendering views
import bodyParser from "body-parser"; // Parses submitted form data into req.body
import pg from "pg"; // node-postgres driver for connecting to PostgreSQL

// pg.Client opens a single connection used once at startup to load quiz data
// (see db.query("SELECT * FROM capitals", ...) below). No route handler in
// this file queries the database again after that — everything else works
// off the in-memory `quiz` array. For an app that needed to query per-request,
// `pg.Pool` would be the better choice so multiple requests could query
// concurrently instead of sharing one connection.
//
// !!! SECURITY WARNING !!!
// `user` and `password` below are a hardcoded, real-looking database
// credential pair committed into source control. This is unsafe: anyone who
// can read this file or the git history can see the credentials. Because
// this password is already committed, treat it as COMPROMISED and rotate it
// on the actual database.
// Instead, store these in a `.env` file (added to `.gitignore`) and load them
// with the `dotenv` package via `process.env`:
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
  password: "edward0823",
  port: 5432,
});

const app = express();
const port = 3000;

db.connect(); // Opens the TCP connection to PostgreSQL described above.

// Fallback/default quiz data used only until the database query below
// finishes and overwrites `quiz` with real rows from Postgres.
let quiz = [
  { country: "France", capital: "Paris" },
  { country: "United Kingdom", capital: "London" },
  { country: "United States of America", capital: "New York" },
];

// SQL: "SELECT * FROM capitals" -> selects every column and every row from
// the 'capitals' table (expected columns include country name and capital
// city). Uses the callback-style `db.query(sql, callback)` API — the
// callback receives (err, res) once the query completes.
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack); // Log the error and keep the fallback quiz array above
  } else {
    quiz = res.rows; // res.rows is an array of row objects (e.g. { country, capital })
    // from the capitals table; replaces the hardcoded fallback data so the
    // quiz now uses real data from the database.
  }
  db.end(); // Close the database connection. Because this fires once at
  // startup (inside the query callback) and no route below queries the
  // database again, closing here doesn't break anything else in this file.
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
// Doesn't query the database directly — relies on the `quiz` array that was
// populated in memory from the 'capitals' table when the server started.
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
// Also works entirely off the in-memory `currentQuestion`/`quiz` data;
// no database access happens on this route.
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Picks a random country/capital pair from the in-memory `quiz` array (which
// was loaded from the Postgres 'capitals' table) to be the next question.
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

// Start the Express server; the callback runs once it's ready to accept
// requests on the given port.
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
