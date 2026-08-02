// Import the Express framework used to build the REST API server
import express from "express";
// Import body-parser middleware, which reads/parses incoming request bodies
// (JSON or URL-encoded) and populates req.body so route handlers can use it
import bodyParser from "body-parser";

// Create the Express application instance
const app = express();
// Port this API server will listen on. Note this is a different port than
// the front-end server.js (which runs on 3000), since this file IS the
// backend API that server.js calls over HTTP using axios.
const port = 4000;

// In-memory data store: acts as our "database" of blog posts for this
// practice exercise. Every route below should read from and/or mutate this
// array directly. Data resets whenever the server restarts.
let posts = [
  {
    id: 1,
    title: "The Rise of Decentralized Finance",
    content:
      "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
    author: "Alex Thompson",
    date: "2023-08-01T10:00:00Z",
  },
  {
    id: 2,
    title: "The Impact of Artificial Intelligence on Modern Businesses",
    content:
      "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
    author: "Mia Williams",
    date: "2023-08-05T14:30:00Z",
  },
  {
    id: 3,
    title: "Sustainable Living: Tips for an Eco-Friendly Lifestyle",
    content:
      "Sustainability is more than just a buzzword; it's a way of life. As the effects of climate change become more pronounced, there's a growing realization about the need to live sustainably. From reducing waste and conserving energy to supporting eco-friendly products, there are numerous ways we can make our daily lives more environmentally friendly. This post will explore practical tips and habits that can make a significant difference.",
    author: "Samuel Green",
    date: "2023-08-10T09:15:00Z",
  },
];

// Tracks the most recently used post id so new posts can be assigned a
// unique, incrementing id (id: ++lastId) instead of reusing existing ids.
let lastId = 3;

// Middleware (runs on every incoming request, in order, before route
// handlers below). Both are registered so this API can accept post data
// sent either as JSON or as traditional URL-encoded form data.
app.use(bodyParser.json()); // Parses application/json request bodies into req.body
app.use(bodyParser.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded bodies into req.body

//Write your code here//

// CHALLENGE 1: GET All posts
// TODO: Define a GET route at "/posts" that responds with the full `posts`
// array as JSON (res.json(posts)) and a 200 status (the default for res.json).

// CHALLENGE 2: GET a specific post by id
// TODO: Define a GET route at "/posts/:id" that:
//   - reads the id from req.params.id (remember to parseInt it, since route
//     params are always strings)
//   - uses posts.find(...) to locate the matching post
//   - responds with 404 and a JSON error message if no post is found
//   - otherwise responds with the found post as JSON (200 by default)

// CHALLENGE 3: POST a new post
// TODO: Define a POST route at "/posts" that:
//   - reads title/content/author from req.body (sent in the request body,
//     not the URL, which is why the body-parser middleware above is needed)
//   - builds a new post object with a fresh id (e.g. ++lastId) and a date
//   - pushes the new post into the `posts` array
//   - responds with the created post as JSON and a 201 Created status
//     (res.status(201).json(post)) to indicate a new resource was created

// CHALLENGE 4: PATCH a post when you just want to update one parameter
// TODO: Define a PATCH route at "/posts/:id" that:
//   - finds the post matching req.params.id
//   - responds 404 if it doesn't exist
//   - only overwrites the fields that were actually provided in req.body
//     (e.g. `if (req.body.title) post.title = req.body.title;`), leaving
//     any omitted fields unchanged -- this is what distinguishes PATCH
//     (partial update) from PUT (full replacement)
//   - responds with the updated post as JSON

// CHALLENGE 5: DELETE a specific post by providing the post id.
// TODO: Define a DELETE route at "/posts/:id" that:
//   - uses posts.findIndex(...) to locate the matching post's index
//   - responds 404 if it isn't found
//   - otherwise removes it with posts.splice(index, 1)
//   - responds with a confirmation JSON message (e.g. { message: "Post deleted" })

// Start the server and listen for incoming requests on the configured port
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
