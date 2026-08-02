// PRACTICE 4: Same session + Passport LocalStrategy auth flow as practice3, but
// now every secret/credential is pulled from ENVIRONMENT VARIABLES via the
// `dotenv` package instead of being hardcoded in source code. This is the fix
// for the hardcoded-secret anti-patterns flagged in practice1-3/index.js.
// See practice4/README.md in this folder for a deeper dive into dotenv + .env.
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv"; // import dotenv module - loads key=value pairs from a local .env file into process.env

/*
Usually you don't upload .env to github!!!
*/
// NOTE: This repo's practice4/.env IS committed alongside this code (there is
// no .gitignore in this section), which defeats the purpose of using dotenv -
// any secrets inside it should be treated as exposed/compromised. In a real
// project, add a `.gitignore` containing `.env` at the project root so the
// file with actual secret values never reaches version control. Only an
// ".env.example" file (with placeholder values, no real secrets) should be committed.

const app = express();
const port = 3000;
const saltRounds = 10; // bcrypt cost factor - see practice2/index.js for a full explanation of salting
env.config(); // Reads the .env file in the project root and copies its key=value pairs into process.env, making them available as process.env.SESSION_SECRET, process.env.PG_USER, etc.

// Session middleware - same mechanism as practice3, but the secret is no
// longer hardcoded: it's read from process.env.SESSION_SECRET, which dotenv
// loaded from the local .env file above. This means the real secret value
// never has to appear in the source code itself.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // Don't re-save unchanged sessions back to the store
    saveUninitialized: true, // Persist new, empty sessions so a session exists before the user logs in
    // (No explicit `cookie: { maxAge, secure, httpOnly }` block here - it falls
    // back to express-session's defaults. In production you would want to set
    // these explicitly, especially `secure: true` and `httpOnly: true` over HTTPS.)
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

// Database credentials are now all read from environment variables instead of
// being hardcoded (compare with practice1-3/index.js, which hardcode
// "edwardhe"/"your_postgres_password" directly in source). This is the correct pattern -
// just remember the underlying .env file itself must never be committed to git.
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// GET /logout - LOGS THE USER OUT by destroying their authenticated session.
// `req.logout()` is provided by Passport; it removes the `req.user` property
// and clears the login session so `req.isAuthenticated()` will return false
// on subsequent requests, even though the browser may still hold the cookie.
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err); // NOTE: `next` is not defined/imported in this scope - this would throw a ReferenceError if req.logout ever actually errors
    }
    res.redirect("/"); // After logging out, send the user back to the public home page
  });
});

// GET /secrets - PROTECTED ROUTE: only reachable by an authenticated (logged-in) user.
app.get("/secrets", (req, res) => {
  // console.log(req.user);
  if (req.isAuthenticated()) { // Provided by Passport; true only if this request's session cookie maps to a logged-in user
    res.render("secrets.ejs");
  } else {
    res.redirect("/login"); // Not logged in -> bounce to the login page
  }
});

// POST /login - LOGIN route. `passport.authenticate("local", ...)` runs the
// LocalStrategy `verify` function defined below; on success it calls
// req.login() internally (creating the authenticated session) then redirects
// to successRedirect, otherwise it redirects to failureRedirect.
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

// POST /register - REGISTRATION route: creates a new user with a bcrypt-hashed password.
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.redirect("/login"); // NOTE: `req.redirect` does not exist on Express request objects (redirect is a `res` method, e.g. `res.redirect("/login")`) - this line would throw a TypeError at runtime if this branch is hit
    } else {
      // Hash the password with bcrypt (10 salt rounds) before ever storing it -
      // see practice2/index.js for a full explanation of bcrypt.hash and salting.
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash] // Only the hash is stored, never the plaintext password
          );
          const user = result.rows[0];
          // Automatically log the new user in (establishes the session) right after registering
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// LocalStrategy: verifies a username/password pair against the database.
// Passport calls this function automatically whenever `passport.authenticate("local", ...)` runs.
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        // Compare the submitted plaintext password against the stored bcrypt
        // hash - see practice2/index.js for how bcrypt.compare works internally.
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// Serialize/deserialize control what gets stored in (and read back out of) the
// session. Here the FULL user object is stored/returned directly rather than
// just the user's ID (contrast with practice3/index.js, which serializes only
// `user.id` and re-queries the database in deserializeUser). Storing the full
// object is simpler but makes the session payload larger and means the
// in-session copy of the user can go stale if the database record changes
// later. See Serialization&Deserialization.md in the practice3 folder for more detail.
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
