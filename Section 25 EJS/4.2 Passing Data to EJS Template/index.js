// Express framework: creates the server, handles routing and rendering views.
import express from "express";
// body-parser: middleware that parses incoming request bodies (e.g. form
// submissions) so they are available as a JS object on req.body.
import bodyParser from "body-parser";

// Create the Express application instance.
const app = express();
// Port the local development server will listen on.
const port = 3000;

// Middleware: parses URL-encoded form data (the default encoding used by
// standard HTML <form> submissions) and populates req.body with the parsed
// key/value pairs. `extended: true` allows parsing of rich/nested objects
// using the "qs" library instead of the simpler built-in querystring library.
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * GET /
 * Renders the home page. No data is passed here on the initial page load,
 * so the template relies on `locals` (see index.ejs) to check whether
 * `numberOfLetters` exists before trying to display it.
 */
app.get("/", (req, res) => {
  res.render("index.ejs");
});

/**
 * POST /submit
 * Handles the form submission from index.ejs (first name + last name).
 * Reads req.body.fName and req.body.lName (made available by the
 * body-parser middleware above), calculates the combined number of
 * characters in both names, then re-renders the same page while exposing
 * that count to the template.
 */
app.post("/submit", (req, res) => {
  const body = req.body;
  // Combine the lengths of the first and last name strings.
  const numLetters = body.fName.length + body.lName.length;
  // res.locals is an object whose properties are automatically available as
  // local variables inside any view rendered during this request/response
  // cycle, without needing to pass them explicitly as a second argument to
  // res.render(). This is an alternative to passing a data object directly.
  res.locals.numberOfLetters = numLetters;
  res.render("index.ejs");
  // The following also works
  // res.render("index.ejs", {numberOfLetters: numLetters})
});

// Start the HTTP server and listen for incoming requests on the given port.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});