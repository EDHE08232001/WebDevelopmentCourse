import express from "express"; // Importing Express.js for creating the web server
import bodyParser from "body-parser"; // Importing body-parser to parse incoming request bodies
import pg from "pg"; // Importing the 'pg' module for connecting to PostgreSQL
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing

// Importing necessary modules for managing cookies and sessions
import passport from "passport"; // Passport.js for authentication middleware
import session from "express-session"; // Express-session for managing user sessions
import { Strategy } from "passport-local"; // Local Strategy for username-password based authentication

const app = express(); // Initializing an Express application
const port = 3000; // Setting the port number for the server to listen on
const saltRounds = 10; // Number of rounds to hash the password with bcrypt for added security

// Middleware to parse URL-encoded form data from requests
app.use(bodyParser.urlencoded({ extended: true })); // 'extended: true' allows parsing of nested objects
app.use(express.static("public")); // Serves static files (like CSS, images) from the 'public' directory

// Middleware for managing sessions
app.use(session({
  secret: "TOPSECRETWORD", // Secret key used to sign the session ID cookie, ensuring the session is secure
  resave: false, // Prevents session from being saved back to the session store if it wasn't modified
  saveUninitialized: true, // Saves a new, unmodified session to the store
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Sets cookie lifespan to 1 day (in milliseconds)
    // Other options like 'secure' and 'httpOnly' can be set for enhanced security
  },
}));

// Initialize Passport.js middleware after session middleware
app.use(passport.initialize()); // Initializes Passport for managing user authentication
app.use(passport.session()); // Integrates Passport with Express sessions, allowing persistent login sessions

// Database configuration for PostgreSQL
const db = new pg.Client({
  user: "edwardhe", // Username for the database
  host: "localhost", // Database server address
  database: "secrets", // Name of the database
  password: "edward0823", // Password for the database
  port: 5432, // Port on which PostgreSQL is running
});
db.connect(); // Establishes a connection to the PostgreSQL database

// Route for rendering the homepage
app.get("/", (req, res) => {
  res.render("home.ejs"); // Renders the 'home.ejs' template
});

// Route for rendering the login page
app.get("/login", (req, res) => {
  res.render("login.ejs"); // Renders the 'login.ejs' template
});

// Route for rendering the registration page
app.get("/register", (req, res) => {
  res.render("register.ejs"); // Renders the 'register.ejs' template
});

// Route for the secrets page, which is protected and requires authentication
app.get("/secrets", (req, res) => {
  console.log(req.user); // Logs the authenticated user's information to the console
  if (req.isAuthenticated()) { // Checks if the user is authenticated using Passport
    res.render("secrets.ejs"); // Renders the 'secrets.ejs' page if the user is authenticated
  } else {
    res.redirect("/login"); // Redirects to the login page if the user is not authenticated
  }
});

// Handling user registration
app.post("/register", async (req, res) => {
  const email = req.body.username; // Extracting the username (email) from the request body
  const password = req.body.password; // Extracting the password from the request body

  try {
    // Check if the email already exists in the database
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) { // If the email is already registered
      res.send("Email already exists. Try logging in."); // Inform the user that the email is taken
    } else {
      // Hash the password using bcrypt
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) { // Handle hashing errors
          console.error("Error hashing password:", err); // Log the error
        } else {
          console.log("Hashed Password:", hash); // Log the hashed password
          // Save the new user to the database
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0]; // Retrieve the newly created user object
          // Automatically log in the user after successful registration
          req.login(user, (err) => {
            if (err) { // Handle login errors
              console.error("Login error:", err); // Log any login errors
            }
            res.redirect("/secrets"); // Redirect to the secrets page upon successful login
          });
        }
      });
    }
  } catch (err) { // Catch block for handling database errors
    console.log("Database error:", err); // Log any database errors
  }
});

// Handling user login using Passport.js local strategy
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets", // Redirect to the secrets page upon successful login
  failureRedirect: "/login", // Redirect back to the login page upon failure
}));

// Configuring Passport.js to use a local strategy for authentication
passport.use(new Strategy(async function verify(username, password, cb) {
  // 'username' and 'password' are the credentials provided by the user
  // 'cb' is the callback function to return control to Passport after verification
  console.log("Authenticating user:", username); // Log the username being authenticated

  try {
    // Fetch the user from the database by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
    if (result.rows.length > 0) { // If a user is found
      const user = result.rows[0]; // Retrieve the user record from the database
      const storedHashedPassword = user.password; // The hashed password stored in the database
      // Compare the provided password with the hashed password from the database
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) { // If bcrypt comparison fails
          return cb(err); // Return the error to the callback
        } else {
          if (result) { // If the passwords match
            return cb(null, user); // Authentication successful, return the user object
          } else { // If passwords do not match
            return cb(null, false); // Authentication failed, return false
          }
        }
      });
    } else { // If user is not found in the database
      return cb(null, false, { message: "User not found" }); // Return a failure message
    }
  } catch (err) { // Catch block for handling errors during authentication
    console.log("Error during authentication:", err); // Log any errors during authentication
    return cb(err); // Pass the error to the callback
  }
}));

// Serializes user information into the session
passport.serializeUser((user, cb) => {
  // 'user' is the user object from authentication
  // 'cb' is the callback function to pass the serialized user ID to Passport
  cb(null, user.id); // Serialize only the user ID to keep the session lightweight
});

// Deserializes user information from the session
passport.deserializeUser((id, cb) => {
  // 'id' is the user ID retrieved from the session
  // 'cb' is the callback function to pass the deserialized user object back to Passport
  db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    if (err) { // If a database error occurs
      return cb(err); // Pass the error to the callback
    }
    cb(null, result.rows[0]); // Attach the user object to the request
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});
