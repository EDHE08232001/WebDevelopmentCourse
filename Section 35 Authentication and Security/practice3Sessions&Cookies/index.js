// PRACTICE 3: Builds on practice2 (bcrypt hashing) by adding SESSIONS & COOKIES
// via express-session and Passport.js, so a logged-in user stays logged in
// across multiple requests instead of having to "log in" on every single page.
import express from "express"; // Importing Express.js for creating the web server
import bodyParser from "body-parser"; // Importing body-parser to parse incoming request bodies
import pg from "pg"; // Importing the 'pg' module for connecting to PostgreSQL
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing

// Importing necessary modules for managing cookies and sessions
import passport from "passport"; // Passport.js: pluggable authentication middleware for Node/Express
import session from "express-session"; // express-session: creates a server-side session and a signed session-ID cookie
import { Strategy } from "passport-local"; // passport-local: a Passport "strategy" that authenticates using a username + password (as opposed to OAuth, etc.)

const app = express(); // Initializing an Express application
const port = 3000; // Setting the port number for the server to listen on
const saltRounds = 10; // Number of rounds to hash the password with bcrypt for added security

// Middleware to parse URL-encoded form data from requests
app.use(bodyParser.urlencoded({ extended: true })); // 'extended: true' allows parsing of nested objects
app.use(express.static("public")); // Serves static files (like CSS, images) from the 'public' directory

// Middleware for managing sessions.
// How express-session works conceptually:
//   1. On first request, the server creates a session object (stored server-side,
//      in memory by default here) and gives it a unique session ID.
//   2. That session ID is sent to the browser inside a cookie, cryptographically
//      SIGNED using the `secret` below (this prevents users from tampering with
//      their own session ID cookie).
//   3. On every subsequent request, the browser automatically sends the cookie
//      back; express-session verifies the signature and loads the matching
//      session data server-side (e.g. "this session belongs to user #4").
// SECURITY WARNING - HARDCODED SESSION SECRET:
// "TOPSECRETWORD" is hardcoded directly in source code instead of coming from
// an environment variable. Anyone who reads this file (or the git history)
// could forge valid-looking signed session cookies. Because this file is
// committed, this secret should be treated as compromised. FIX: load it from
// an environment variable instead, e.g. `secret: process.env.SESSION_SECRET`
// with the real value kept only in a local, gitignored `.env` file (see
// practice4/index.js, which does this correctly).
app.use(session({
  secret: "TOPSECRETWORD", // Secret key used to sign the session ID cookie, ensuring the session is secure
  resave: false, // Don't re-save the session to the store on every request if nothing in it changed (avoids unnecessary writes/race conditions)
  saveUninitialized: true, // Save a new session even if it hasn't been modified yet (needed so login attempts on a brand-new visit get a session to attach to)
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Sets cookie lifespan to 1 day (in milliseconds) - after this, the browser discards the cookie and the user must log in again
    // Other options like 'secure' (HTTPS-only cookie) and 'httpOnly' (blocks
    // client-side JS from reading the cookie, reducing XSS risk) should also be
    // set for production use - see the top-level Section 35 README's security checklist.
  },
}));

// Initialize Passport.js middleware after session middleware (order matters!).
app.use(passport.initialize()); // Sets up Passport's internal state on every request
app.use(passport.session()); // Bridges Passport with express-session: reads the logged-in user out of req.session and attaches it as req.user

// SECURITY WARNING: Hardcoded database credentials ("edwardhe" / "edward0823")
// committed directly in source code - same issue as practice1 and practice2.
// These should be moved to environment variables (process.env.PG_USER,
// process.env.PG_PASSWORD, ...) loaded via dotenv, as done in practice4/index.js,
// with the .env file excluded from version control via .gitignore. Treat this
// value as compromised since it is already committed.
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

// Route for the secrets page - this is a PROTECTED ROUTE / access-control example.
// `req.isAuthenticated()` is a helper Passport attaches to every request; it
// returns true only if the incoming request's session cookie corresponds to a
// currently logged-in user (i.e. passport.deserializeUser succeeded below).
app.get("/secrets", (req, res) => {
  console.log(req.user); // Logs the authenticated user's information to the console
  if (req.isAuthenticated()) { // Checks if the user is authenticated using Passport
    res.render("secrets.ejs"); // Renders the 'secrets.ejs' page if the user is authenticated
  } else {
    res.redirect("/login"); // Not logged in (or session expired) -> redirect to the login page instead of exposing protected content
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

// Handling user login using Passport.js LocalStrategy.
// `passport.authenticate("local", options)` is itself Express middleware: it
// runs the `verify` function registered below via `passport.use(new Strategy(...))`,
// and if verification succeeds it calls `req.login()` internally, establishing
// the session, before redirecting to `successRedirect`.
app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets", // Redirect to the secrets page upon successful login
  failureRedirect: "/login", // Redirect back to the login page upon failure
}));

// Configuring Passport.js's LocalStrategy: authenticates using a
// username/email + password combo supplied via a login form (as opposed to,
// say, GoogleStrategy which delegates to an external OAuth provider - see practice5).
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

// Serializes user information into the session.
// (See also Serialization&Deserialization.md in this folder for a deeper dive.)
passport.serializeUser((user, cb) => {
  // 'user' is the user object from authentication
  // 'cb' is the callback function to pass the serialized user ID to Passport
  cb(null, user.id); // Serialize only the user ID to keep the session lightweight
});

// Deserializes user information from the session: takes the ID that was
// stored in the session cookie's server-side data and looks up the full user
// record again on each request, attaching it to req.user.
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
