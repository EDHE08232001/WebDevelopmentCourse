import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Temporary storage for posts
let posts = [];

// Middlewares
app.use(express.static("./public")); // Serving static files from 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parsing URL-encoded bodies

// Route to display all posts
app.get("/", (req, res) => {
    res.render("index.ejs", { posts: posts });
});

// Route to handle post creation
app.post("/create-post", (req, res) => {
    const post = req.body.post; // Assuming 'post' is the name of your form field
    if (post) { // Ensuring that an empty post cannot be added
        posts.push(post); // Add the new post to the array
    }
    res.redirect("/"); // Redirect back to the homepage to display all posts
});

// Route to handle post deletion
app.get("/delete-post", (req, res) => {
    const postIndex = parseInt(req.query.postIndex);
    if (postIndex >= 0 && postIndex < posts.length) {
        posts.splice(postIndex, 1);
    }
    res.redirect("/");
});


// Connecting to the determined port
app.listen(port, () => {
    console.log(`App is up at port ${port}`);
});
