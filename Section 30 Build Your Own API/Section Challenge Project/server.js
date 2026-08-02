// NOTE: This file is NOT the REST API itself -- it's a separate front-end/
// client server. It renders HTML (via EJS templates) for a browser to use,
// and it talks to the actual REST API (defined in index.js, running on
// port 4000) using axios HTTP requests. This mirrors a real-world setup
// where a browser-facing web server consumes a backend API.

// Import Express to build this front-end web server
import express from "express";
// Import body-parser to parse incoming form submissions from the browser
// (e.g. the "New Post"/"Edit Post" HTML forms) into req.body
import bodyParser from "body-parser";
// Import axios, an HTTP client used here to make requests from this server
// to the backend REST API (GET/POST/PATCH/DELETE against API_URL)
import axios from "axios";

// Create the Express application instance for the front-end server
const app = express();
// Port the front-end server listens on (different from the API's port 4000)
const port = 3000;
// Base URL of the backend REST API that this server proxies requests to
const API_URL = "http://localhost:4000";

// Serve static assets (CSS, client-side JS, images) from the "public" folder
app.use(express.static("public"));

// Middleware: parse URL-encoded bodies (standard HTML <form> submissions)
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware: parse JSON bodies (in case any request sends JSON directly)
app.use(bodyParser.json());

// Route to render the main page
// Handle GET requests to "/" (the homepage). This does not read from an
// in-memory array directly -- instead it calls the REST API over HTTP.
app.get("/", async (req, res) => {
  try {
    // Ask the backend API for every post (GET http://localhost:4000/posts)
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response);
    // Render the "index.ejs" template, passing the posts array returned by
    // the API in as a template variable so the page can list all posts
    res.render("index.ejs", { posts: response.data });
  } catch (error) {
    // If the API call fails (e.g. API server down), respond with 500
    // Internal Server Error and a JSON error message
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// Route to render the edit page
// Handle GET requests to "/new": shows a blank form for creating a post.
// No API call is needed here since we're not loading any existing data.
app.get("/new", (req, res) => {
  // Render "modify.ejs" reused for both create and edit, with heading/submit
  // button text customized for the "create" case and no existing `post` data
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post" });
});

// Handle GET requests to "/edit/:id": shows the same form pre-filled with an
// existing post's data so the user can update it.
app.get("/edit/:id", async (req, res) => {
  try {
    // Fetch the specific post to edit from the API using the id route param
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    console.log(response.data);
    // Render the same "modify.ejs" template, but now pre-populated with the
    // fetched post's data and "edit" wording
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// Create a new post
// Handle POST requests to "/api/posts", triggered when the "New Post" form
// on the front end is submitted.
app.post("/api/posts", async (req, res) => {
  try {
    // Forward the submitted form data (req.body) to the backend API's
    // POST /posts endpoint, which actually creates the post
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    // After creating the post, redirect the browser back to the homepage
    // (this is the Post/Redirect/Get pattern, avoiding duplicate form
    // submissions on refresh)
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// Partially update a post
// Handle POST requests to "/api/posts/:id", triggered when the "Edit Post"
// form is submitted. HTML forms can only send GET/POST, so this front end
// uses a POST route that internally issues a PATCH to the real API.
app.post("/api/posts/:id", async (req, res) => {
  console.log("called");
  try {
    // Forward the edited fields (req.body) to the backend API's
    // PATCH /posts/:id endpoint to update only the changed fields
    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );
    console.log(response.data);
    // Redirect back to the homepage after the update succeeds
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post
// Handle GET requests to "/api/posts/delete/:id", triggered by a "Delete"
// link/button in the UI (a plain link can only issue a GET request, which is
// why this uses GET here even though it performs a delete action).
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    // Call the backend API's DELETE /posts/:id endpoint to remove the post
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    // Redirect back to the homepage after deletion
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Start this front-end server, listening on port 3000. The backend API
// (index.js) must also be running separately on port 4000 for these routes
// to work, since every route above depends on calling it via axios.
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
