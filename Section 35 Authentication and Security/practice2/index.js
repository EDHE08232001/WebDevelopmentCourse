// PRACTICE 2: Same registration/login flow as practice1, but now passwords are
// HASHED with bcrypt before being stored/compared instead of kept in plaintext.
// This is the fix for the plaintext-password anti-pattern shown in practice1/index.js.
// (Note: the header below says "ENCRYPTION" but bcrypt performs one-way HASHING,
// not reversible encryption - hashes cannot be decrypted back into the original password.)

// ENCRYPTION

// Importing required modules
import express from "express"; // Web framework for building APIs
import bodyParser from "body-parser"; // Middleware to parse incoming request bodies
import pg from "pg"; // PostgreSQL client for Node.js
import bcrypt from "bcrypt"; // Library for hashing and checking passwords

const app = express(); // Initialize the Express application
const port = 3000; // Port number for the server to listen on
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// SECURITY WARNING: Hardcoded database credentials below ("edwardhe" / "edward0823").
// Committing real credentials to source control means anyone with repo access
// can read them; if this were a real/live password it should be treated as
// compromised and rotated. These values should instead be loaded from
// environment variables via a .env file + the `dotenv` package (see
// practice4/index.js for the pattern: process.env.PG_USER, process.env.PG_PASSWORD, etc.),
// with .env excluded from git via .gitignore.
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
      // Password Hashing with bcrypt.
      // bcrypt.hash(plaintextPassword, saltRounds, callback) does two things:
      //   1. Generates a random "salt" (extra random data) using `saltRounds`
      //      (here 10) as a cost factor - higher saltRounds = more computationally
      //      expensive = slower to brute-force, but slower to compute too.
      //   2. Combines the salt with the password and runs it through the bcrypt
      //      hashing algorithm multiple times to produce a one-way hash string.
      // The salt is stored as part of the resulting hash string itself, so bcrypt
      // can later re-derive it during comparison - there's no need to store the
      // salt separately. Because hashing is one-way, even if the database leaks,
      // an attacker cannot directly recover the original passwords.
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err); // Log any error that occurs during hashing
        } else {
          console.log(hash); // Log the hashed password
          // Insert the new user into the database with the HASHED password
          // (never the plaintext `password` variable) - this is the key fix vs practice1.
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

      // Compare the entered password with the stored hashed password.
      // bcrypt.compare(plaintextPassword, storedHash, callback) re-hashes the
      // submitted plaintext password using the salt embedded in `storedHashedPassword`
      // and checks whether the result matches. It returns true/false without ever
      // needing to "decrypt" the stored hash (which isn't possible - hashing is one-way).
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
