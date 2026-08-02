// Express: minimal web framework used to define routes and start the HTTP server.
import express from "express";
// body-parser: middleware that parses incoming request bodies (e.g. HTML form
// submissions) so we can read them as plain JavaScript objects via req.body.
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Temporary storage for posts
//
// EDUCATIONAL NOTE: This is an in-memory array, not a database. It lives only
// in the Node.js process's RAM. Every time the server restarts (crash, deploy,
// nodemon reload, etc.) this array is re-initialized to [] and ALL previously
// created posts are permanently lost. This is fine for learning/demo purposes,
// but a real application would persist posts in a database (e.g. MongoDB,
// PostgreSQL) so data survives restarts and can be shared across multiple
// server instances.
let posts = [];

// Middlewares
app.use(express.static("./public")); // Serving static files from 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parsing URL-encoded bodies

// GET "/" - Home page route.
// Renders the "index.ejs" template and passes it the current `posts` array
// as a local variable named `posts`. EJS uses this data to loop over and
// display every blog post currently stored in memory.
app.get("/", (req, res) => {
    res.render("index.ejs", { posts: posts });
});

// POST "/create-post" - Handles submission of the "new post" form.
// Because of the bodyParser.urlencoded middleware above, the submitted form
// fields are available on req.body. Here we pull out the field named "post"
// (this name must match the `name="post"` attribute on the form's <input>).
app.post("/create-post", (req, res) => {
    const post = req.body.post; // Assuming 'post' is the name of your form field
    if (post) { // Ensuring that an empty post cannot be added
        posts.push(post); // Add the new post to the array
    }
    res.redirect("/"); // Redirect back to the homepage to display all posts
});

// GET "/delete-post" - Handles deleting a single post.
// The index of the post to delete is passed as a query string parameter,
// e.g. "/delete-post?postIndex=2".
//
// Why parseInt is needed: query string values always arrive as strings
// (req.query.postIndex would be the string "2", not the number 2), so we must
// convert it with parseInt before using it as an array index.
//
// Why bounds checking matters: parseInt on missing/invalid input (e.g. an
// empty, non-numeric, or tampered-with query value) returns NaN, and any
// comparison against NaN is always false. The check
// `postIndex >= 0 && postIndex < posts.length` guards against:
//   1. NaN (malformed/missing query param) - the condition simply fails safely.
//   2. Negative numbers - which would cause Array.prototype.splice to delete
//      from the end of the array instead of throwing, deleting the wrong post.
//   3. Out-of-range numbers (>= posts.length) - which would otherwise be a
//      no-op in splice, but explicit bounds checking keeps the intent clear
//      and prevents unexpected behavior if the deletion logic changes later.
app.get("/delete-post", (req, res) => {
    const postIndex = parseInt(req.query.postIndex);
    if (postIndex >= 0 && postIndex < posts.length) {
        posts.splice(postIndex, 1);
    }
    res.redirect("/");
});


// Connecting to the determined port
// Starts the HTTP server and begins listening for incoming requests on the
// specified port. The callback simply logs a confirmation message once the
// server is ready.
app.listen(port, () => {
    console.log(`App is up at port ${port}`);
});
