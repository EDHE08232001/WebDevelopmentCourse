import express from "express"; // Import the express module
import bodyParser from "body-parser"; // Import the body-parser module
import pg from "pg"; // Import the pg module for PostgreSQL

// Set up the database client with connection details
const db = new pg.Client({
  user: "edwardhe", // Database username
  host: "localhost", // Database host
  database: "world_demo", // Database name
  password: "edward0823", // Database password
  port: 5432, // Database port
});

const app = express(); // Create an express application
const port = 3000; // Define the port on which the server will run

db.connect(); // Connect to the PostgreSQL database

let quiz = []; // Initialize an array to store quiz data
db.query("SELECT * FROM flags", (err, res) => {
  // Query the database for all records in the 'flags' table
  if (err) {
    console.error("Error executing query", err.stack); // Log an error if the query fails
  } else {
    quiz = res.rows; // Store the query results in the quiz array
  }
  db.end(); // Close the database connection
});

let totalCorrect = 0; // Initialize a variable to keep track of correct answers

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Use body-parser to parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the 'public' directory

let currentQuestion = {}; // Initialize an object to store the current question

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0; // Reset the total correct answers to 0
  await nextQuestion(); // Get the next question
  console.log(currentQuestion); // Log the current question to the console
  res.render("index.ejs", { question: currentQuestion }); // Render the home page with the current question
});

// POST a new post (answer submission)
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
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`); // Log a message indicating that the server is running
});
