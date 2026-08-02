// Express framework: creates the server and handles routing/rendering.
import express from "express";

// Create the Express application instance.
const app = express();
// Port the local development server will listen on.
const port = 3000;

// step 2
// Middleware: serves static assets (CSS, images, client-side JS) from the
// "public" folder directly, so e.g. "public/styles/content.css" is reachable
// in the browser at "/styles/content.css" without a dedicated route.
app.use(express.static("./public"));

/* Write your code here:
Step 1: Render the home page "/" index.ejs
Step 2: Make sure that static files are linked to and the CSS shows up.
Step 3: Add the routes to handle the render of the about and contact pages.
  Hint: Check the nav bar in the header.ejs to see the button hrefs
Step 4: Add the partials to the about and contact pages to show the header and footer on those pages. */

/**
 * GET /
 * Renders the home page ("index.ejs"). No dynamic data is passed here; the
 * page's shared header/footer content is pulled in via EJS partials inside
 * the template itself (e.g. <%- include("partials/header.ejs") %>).
 */
// step 1
app.get("/", (req, res) => {
  res.render("index.ejs");
});

/**
 * GET /about
 * Renders the About page ("about.ejs"). Reached via the "About" nav link
 * defined in the header partial.
 */
// step 3 - 1
app.get("/about", (req, res) => {
  res.render("about.ejs")
});

/**
 * GET /contact
 * Renders the Contact page ("contact.ejs"). Reached via the "Contact" nav
 * link defined in the header partial.
 */
// step 3 - 2
app.get("/contact", (req, res) => {
  res.render("contact.ejs")
});

// Start the HTTP server and listen for incoming requests on the given port.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});