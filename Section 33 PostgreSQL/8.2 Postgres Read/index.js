import express from "express"; // Import the express module
import bodyParser from "body-parser"; // Import the body-parser module
import pg from "pg"; // Import the pg module (node-postgres) for talking to PostgreSQL from Node.js

// pg.Client represents a SINGLE, dedicated connection to the database.
// It is fine for small scripts/demos like this one, but for real production
// apps you would typically use `pg.Pool` instead, which manages a pool of
// reusable connections so that multiple requests can query the database
// concurrently without waiting on a single connection.
// Set up the database client with connection details
//
// !!! SECURITY WARNING !!!
// The `user` and `password` fields below are hardcoded, real-looking
// database credentials committed directly into source control. This is a
// bad practice: anyone with access to this repository (or its git history)
// can read them and connect to the database. Because this password has
// already been committed, it should be treated as COMPROMISED — rotate/change
// it on the actual database as soon as possible.
// The recommended fix is to move these values out of the code and into
// environment variables using a `.env` file + the `dotenv` package, e.g.:
//   // .env (never commit this file — add it to .gitignore)
//   PGUSER=edwardhe
//   PGPASSWORD=your_postgres_password
//   PGHOST=localhost
//   PGDATABASE=world_demo
//   PGPORT=5432
//
//   // index.js
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
  user: "edwardhe", // Database username
  host: "localhost", // Database host
  database: "world_demo", // Database name
  password: "your_postgres_password", // Database password
  port: 5432, // Database port
});

const app = express(); // Create an express application
const port = 3000; // Define the port on which the server will run

db.connect(); // Connect to the PostgreSQL database. This opens the TCP connection
// described in the config object above; the app can't run any queries until
// this succeeds.

let quiz = []; // Initialize an array to store quiz data
// SQL: "SELECT * FROM flags" -> selects every column and every row from the
// 'flags' table (presumably columns like country name + flag image filename).
// This uses the older callback-style `db.query(sql, callback)` API instead of
// async/await or Promises — the callback receives (err, res).
db.query("SELECT * FROM flags", (err, res) => {
  // Query the database for all records in the 'flags' table
  if (err) {
    console.error("Error executing query", err.stack); // Log an error if the query fails
  } else {
    quiz = res.rows; // res.rows is an array of row objects returned by the query;
    // each object's keys match the column names in the 'flags' table.
    // We store the whole result set in memory so nextQuestion() can pick
    // random questions without hitting the database again.
  }
  db.end(); // Close the database connection. NOTE: since this runs inside the
  // query callback (which fires once, right after the app starts), the
  // connection is closed almost immediately after startup. This works here
  // only because no other route in this file issues further db.query() calls
  // after this point.
});

let totalCorrect = 0; // Initialize a variable to keep track of correct answers

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser to parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the 'public' directory

let currentQuestion = {}; // Initialize an object to store the current question

// GET home page
// This route does NOT query the database directly — it relies on the `quiz`
// array that was already populated in memory by the db.query(...) call above
// when the server started.
app.get("/", async (req, res) => {
  totalCorrect = 0; // Reset the total correct answers to 0
  await nextQuestion(); // Get the next question
  console.log(currentQuestion); // Log the current question to the console
  res.render("index.ejs", { question: currentQuestion }); // Render the home page with the current question
});

// POST a new post (answer submission)
// Also does not touch the database — it just compares the submitted answer
// against the in-memory `currentQuestion` object.
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); // Get the answer from the request body and trim any whitespace
  let isCorrect = false; // Initialize a variable to track if the answer is correct
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    // Check if the answer is correct (case-insensitive)
    totalCorrect++; // Increment the total correct answers
    console.log(totalCorrect); // Log the total correct answers
    isCorrect = true; // Set the answer as correct
  }

  nextQuestion(); // Get the next question
  res.render("index.ejs", {
    // Render the home page with the updated question, whether the last answer was correct, and the total score
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

// Function to get the next question
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)]; // Select a random country from the quiz array
  currentQuestion = randomCountry; // Set the current question to the selected random country
}

// Start the server and listen on the specified port
// app.listen binds an HTTP server to the given port and starts accepting
// incoming requests; the callback runs once the server is ready.
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`); // Log a message indicating that the server is running
});
