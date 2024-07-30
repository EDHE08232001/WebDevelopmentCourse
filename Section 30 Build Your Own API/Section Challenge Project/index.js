// Summary:
// This code sets up a basic Express.js server that provides a RESTful API for managing blog posts.
// It includes endpoints to get all posts, get a specific post by ID, create a new post, update a post, and delete a post.
// The posts are stored in-memory and manipulated using standard HTTP methods (GET, POST, PATCH, DELETE).

import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 4000;

// In-memory data store
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

let lastId = 3; // Keeps track of the last assigned post ID

// Middleware
app.use(bodyParser.json()); // Parses incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// CHALLENGE 1: GET All posts
// This endpoint retrieves all posts from the in-memory data store
app.get("/posts", (req, res) => {
  console.log(posts); // Logs the posts to the console
  res.json(posts); // Responds with the JSON array of all posts
});

// CHALLENGE 2: GET a specific post by id
// This endpoint retrieves a post by its ID
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => {
    return p.id === parseInt(req.params.id); // Finds the post with the matching ID
  });

  if (!post) {
    return res.status(404).json({
      message: "Post not found", // Responds with a 404 status if the post is not found
    });
  }

  res.json(post); // Responds with the found post
});

// CHALLENGE 3: POST a new post
// This endpoint creates a new post
app.post("/posts", (req, res) => {
  const newId = (lastId += 1); // Generates a new ID by incrementing the last ID

  const post = {
    id: newId,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: new Date(), // Sets the current date as the post's date
  };

  lastId = newId; // Updates the last ID
  posts.push(post); // Adds the new post to the in-memory data store
  res.status(201).json(post); // Responds with the created post and a 201 status
});

// CHALLENGE 4: PATCH a post when you just want to update one parameter
// This endpoint updates specific fields of a post by its ID
app.patch("/posts/:id", (req, res) => {
  const post = posts.find((p) => {
    return p.id === parseInt(req.params.id); // Finds the post with the matching ID
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" }); // Responds with a 404 status if the post is not found
  }

  if (req.body.title) {
    post.title = req.body.title; // Updates the title if provided in the request body
  }

  if (req.body.content) {
    post.content = req.body.content; // Updates the content if provided in the request body
  }

  if (req.body.author) {
    post.author = req.body.author; // Updates the author if provided in the request body
  }

  res.json(post); // Responds with the updated post
});

// CHALLENGE 5: DELETE a specific post by providing the post id
// This endpoint deletes a post by its ID
app.delete("/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => {
    return p.id === parseInt(req.params.id); // Finds the index of the post with the matching ID
  });

  if (index === -1) {
    return res.status(404).json({
      message: "Post not found", // Responds with a 404 status if the post is not found
    });
  }

  posts.splice(index, 1); // Removes the post from the in-memory data store
  res.json({
    message: "Post Deleted", // Responds with a confirmation message
  });
});

// Starts the server and listens on the specified port
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
