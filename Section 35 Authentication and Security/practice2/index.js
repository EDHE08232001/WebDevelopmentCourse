// ENCRYPTION

// Importing required modules
import express from "express"; // Web framework for building APIs
import bodyParser from "body-parser"; // Middleware to parse incoming request bodies
import pg from "pg"; // PostgreSQL client for Node.js
import bcrypt from "bcrypt"; // Library for hashing and checking passwords

const app = express(); // Initialize the Express application
const port = 3000; // Port number for the server to listen on
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// Setting up the database connection
const db = new pg.Client({
  user: "edwardhe", // Database username
  host: "localhost", // Database host
  database: "secrets", // Database name
  password: "edward0823", // Database password
  port: 5432, // Database port
});
db.connect(); // Connecting to the database

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded data from the request body
app.use(express.static("public")); // Serving static files from the "public" directory

// Routes
app.get("/", (req, res) => {
  res.render("home.ejs"); // Render the home page
});

app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render the login page
});

app.get("/register", (req, res) => {
  res.render("register.ejs"); // Render the registration page
});

// Register a new user
app.post("/register", async (req, res) => {
  const email = req.body.username; // Get email from the request body
  const password = req.body.password; // Get password from the request body

  try {
    // Check if the email is already registered
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in."); // Email already registered
    } else {
      // Password Hashing with bcrypt
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err); // Log any error that occurs during hashing
        } else {
          console.log(hash); // Log the hashed password
          // Insert the new user into the database with the hashed password
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hash] // Store the hashed password in the database
          );
          console.log(result); // Log the result of the insertion
          res.render("secrets.ejs"); // Render the secrets page upon successful registration
        }
      });
    }
  } catch (err) {
    console.log(err); // Log any errors that occur during registration
  }
});

// Login an existing user
app.post("/login", async (req, res) => {
  const email = req.body.username; // Get email from the request body
  const loginPassword = req.body.password; // Get password from the request body

  try {
    // Check if the email exists in the database
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0]; // Retrieve the user record
      const storedHashedPassword = user.password; // Get the stored hashed password

      // Compare the entered password with the stored hashed password
      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if (err) {
          console.log(err); // Log any error that occurs during comparison
        } else {
          console.log(result); // Log the result of the comparison
          if (result) {
            res.render("secrets.ejs"); // If passwords match, render the secrets page
          } else {
            res.send("Incorrect Password"); // If passwords don't match, send error message
          }
        }
      });
    } else {
      res.send("User not found"); // If email is not found, send error message
    }
  } catch (err) {
    console.log(err); // Log any errors that occur during login
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server has started
});
