import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

// Importing necessary modules for managing cookies and sessions
import passport from "passport"; // Passport.js for authentication
import session from "express-session"; // Express-session for session management
import { Strategy } from "passport-local"; // Local Strategy for username-password based authentication

const app = express();
const port = 3000;
const saltRounds = 10; // Number of rounds to hash the password with bcrypt

app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded form data
app.use(express.static("public")); // Serving static files from the 'public' directory

// Middleware for managing sessions
app.use(session({
  secret: "TOPSECRETWORD", // Secret key used to sign the session ID cookie, ensuring the session is secure
  resave: false, // Prevents the session from being saved back to the session store if it wasn't modified
  saveUninitialized: true, // Saves a new session to the store, even if it's unmodified
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Sets cookie lifespan to 1 day (in milliseconds)
    // Secure, httpOnly, and other cookie attributes can be configured here for added security
  },
}));

// Passport middlewares should be initialized after setting up the session middleware
app.use(passport.initialize()); // Initializes Passport for authentication
app.use(passport.session()); // Allows Passport to use session to track user state

// Database configuration for PostgreSQL
const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "secrets",
  password: "edward0823",
  port: 5432,
});
db.connect(); // Connecting to the PostgreSQL database

// Route for the homepage
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Route for the login page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Route for the registration page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Route for the secrets page, which is protected and requires authentication
app.get("/secrets", (req, res) => {
  console.log(req.user); // Logging the authenticated user's information
  if (req.isAuthenticated()) { // Checks if the user is authenticated
    res.render("secrets.ejs"); // Renders the secrets page if authenticated
  } else {
    res.redirect("/login"); // Redirects to login page if not authenticated
  }
});

// Handling user registration
app.post("/register", async (req, res) => {
  const email = req.body.username; // Extracting the username (email) from the request body
  const password = req.body.password; // Extracting the password from the request body

  try {
    // Check if the email already exists in the database
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in."); // Inform the user if email is already registered
    } else {
      // Hash the password using bcrypt
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err); // Log the error if hashing fails
        } else {
          console.log("Hashed Password:", hash); // Log the hashed password
          // Save the new user to the database
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0]; // The newly created user object
          // Automatically log in the user after registration
          req.login(user, (err) => {
            if (err) {
              console.error("Login error:", err); // Log any errors during login
            }
            res.redirect("/secrets"); // Redirect to the secrets page after successful login
          });
        }
      });
    }
  } catch (err) {
    console.log("Database error:", err); // Handle any database errors
  }
});

// Handling user login using Passport.js local strategy
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets", // Redirects to secrets page on successful login
  failureRedirect: "/login", // Redirects back to login page on failure
}));

// Configuring Passport.js to use a local strategy for authentication
passport.use(new Strategy(async function verify(username, password, cb) {
  console.log("Authenticating user:", username); // Log the username for debugging

  try {
    // Fetch the user from the database by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0]; // Retrieve the user record
      const storedHashedPassword = user.password; // The hashed password stored in the database
      // Compare the provided password with the hashed password from the database
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          return cb(err); // Pass the error to the callback if bcrypt comparison fails
        } else {
          if (result) { // If the passwords match
            return cb(null, user); // Authentication successful
          } else {
            return cb(null, false); // Authentication failed
          }
        }
      });
    } else {
      return cb(null, false, { message: "User not found" }); // If user is not found in the database
    }
  } catch (err) {
    console.log("Error during authentication:", err); // Handle errors during authentication
    return cb(err); // Pass the error to the callback
  }
}));

// Serializes user information into the session
passport.serializeUser((user, cb) => {
  cb(null, user.id); // Serialize only the user ID to keep the session lightweight
});

// Deserializes user information from the session
passport.deserializeUser((id, cb) => {
  db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return cb(err); // Pass the error to the callback if a database error occurs
    }
    cb(null, result.rows[0]); // Attach the user object to the request
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});
