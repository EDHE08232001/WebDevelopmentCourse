import express from "express"; // Import the express module to create an Express app.
import bodyParser from "body-parser"; // Import body-parser to parse incoming request bodies.
import pg from "pg"; // Import the pg module to interact with PostgreSQL databases.
import bcrypt from "bcrypt"; // Import bcrypt to hash passwords for security.
import passport from "passport"; // Import passport for handling authentication.
import { Strategy } from "passport-local"; // Import local strategy for local username/password authentication.
import GoogleStrategy from "passport-google-oauth2"; // Import Google OAuth strategy for Google authentication.
import session from "express-session"; // Import express-session to handle session management.
import env from "dotenv"; // Import dotenv to load environment variables from a .env file.

const app = express(); // Create an instance of an Express application.
const port = 3000; // Define the port on which the server will run.
const saltRounds = 10; // Define the number of salt rounds for hashing passwords with bcrypt.
env.config(); // Load environment variables from a .env file into process.env.

// Configure session middleware to manage user sessions.
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie.
    resave: false, // Do not save the session if it hasn't been modified.
    saveUninitialized: true, // Save uninitialized sessions (sessions that are new but not modified).
  })
);

app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded data.
app.use(express.static("public")); // Serve static files from the "public" directory.

app.use(passport.initialize()); // Initialize Passport for authentication.
app.use(passport.session()); // Use Passport to manage sessions.

const db = new pg.Client({
  user: process.env.PG_USER, // PostgreSQL username.
  host: process.env.PG_HOST, // PostgreSQL host address.
  database: process.env.PG_DATABASE, // PostgreSQL database name.
  password: process.env.PG_PASSWORD, // PostgreSQL password.
  port: process.env.PG_PORT, // PostgreSQL port.
});
db.connect(); // Connect to the PostgreSQL database.

// Define route for the home page.
app.get("/", (req, res) => {
  res.render("home.ejs"); // Render the home.ejs view.
});

// Define route for the login page.
app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render the login.ejs view.
});

// Define route for the registration page.
app.get("/register", (req, res) => {
  res.render("register.ejs"); // Render the register.ejs view.
});

// Define route for logging out.
app.get("/logout", (req, res) => {
  req.logout(function (err) { // Passport's logout method.
    if (err) {
      return next(err); // Call the next middleware function if there is an error.
    }
    res.redirect("/"); // Redirect to the home page after logout.
  });
});

// Define route for secrets page; only accessible if authenticated.
app.get("/secrets", (req, res) => {
  console.log(req.user); // Log the user object for debugging.
  if (req.isAuthenticated()) { // Check if the user is authenticated.
    res.render("secrets.ejs"); // Render the secrets.ejs view.
  } else {
    res.redirect("/login"); // Redirect to the login page if not authenticated.
  }
});

// Define route for Google authentication.
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"], // Request access to user's profile and email from Google.
}));

// Define callback route for Google authentication.
app.get("/auth/google/secrets", passport.authenticate("google", {
  successRedirect: "/secrets", // Redirect to secrets page upon successful authentication.
  failureRedirect: "login", // Redirect to login page upon authentication failure.
}));

// Handle login form submission.
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets", // Redirect to secrets page upon successful login.
    failureRedirect: "/login", // Redirect to login page upon failure.
  })
);

// Handle registration form submission.
app.post("/register", async (req, res) => {
  const email = req.body.username; // Get the username from the form.
  const password = req.body.password; // Get the password from the form.

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]); // Check if the user already exists.

    if (checkResult.rows.length > 0) {
      req.redirect("/login"); // Redirect to login page if the user already exists.
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => { // Hash the password with bcrypt.
        if (err) {
          console.error("Error hashing password:", err); // Log the error if hashing fails.
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          ); // Insert the new user into the database.
          const user = result.rows[0]; // Get the inserted user.
          req.login(user, (err) => { // Log the user in with Passport.
            console.log("success"); // Log a success message.
            res.redirect("/secrets"); // Redirect to the secrets page after successful registration.
          });
        }
      });
    }
  } catch (err) {
    console.log(err); // Log any errors that occur during the process.
  }
});

// Configure local authentication strategy.
passport.use("local",
  new Strategy(async function verify(username, password, cb) { // Define the verification callback.
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]); // Query the database for the user.
      if (result.rows.length > 0) {
        const user = result.rows[0]; // Get the user data from the database.
        const storedHashedPassword = user.password; // Get the stored hashed password.
        bcrypt.compare(password, storedHashedPassword, (err, valid) => { // Compare the input password with the stored hashed password.
          if (err) {
            // Error with password check
            console.error("Error comparing passwords:", err); // Log any error during comparison.
            return cb(err); // Return the error callback.
          } else {
            if (valid) {
              // Passed password check
              return cb(null, user); // Return the user object on successful authentication.
            } else {
              // Did not pass password check
              return cb(null, false); // Return false if authentication fails.
            }
          }
        });
      } else {
        return cb("User not found"); // Return error if user is not found.
      }
    } catch (err) {
      console.log(err); // Log any errors that occur during the process.
    }
  })
);

// Configure Google authentication strategy.
passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID, // Google Client ID from environment variables.
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google Client Secret from environment variables.
  callbackURL: "http://localhost:3000/auth/google/secrets", // The callback URL after Google authentication.
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // URL to fetch user profile information.
}, async (accessToken, refreshToken, profile, cb) => { // Define the callback function.
  console.log("User Profile:\n", profile); // Log the user profile for debugging.

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]); // Check if user exists in the database.
    if (result.rows.length == 0) {
      const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [profile.email, "google"]); // If user does not exist, create a new user.
      cb(null, newUser); // Call the callback with the new user object.
    } else {
      // User exists
      cb(null, result.rows[0]); // Call the callback with the existing user object.
    }
  } catch (err) {
    console.log("Error Message:\n", err); // Log any errors.
    cb(err); // Call the callback with the error.
  }
}));

passport.serializeUser((user, cb) => { // Serialize the user for storing in the session.
  cb(null, user); // Pass the user object to the callback.
});
passport.deserializeUser((user, cb) => { // Deserialize the user for retrieving from the session.
  cb(null, user); // Pass the user object to the callback.
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Start the server and listen on the specified port.
});
