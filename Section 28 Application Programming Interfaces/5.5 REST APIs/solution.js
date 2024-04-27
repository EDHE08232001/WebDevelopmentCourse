// Import necessary modules: Express for the server, Axios for HTTP requests, and bodyParser to parse incoming request bodies
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

// Initialize the Express application
const app = express();
// Define the port on which the server will listen
const port = 3000;
// Set the base URL for the API that the server will communicate with
const API_URL = "https://secrets-api.appbrewery.com";

// Token obtained from previous lessons to authenticate API requests
const yourBearerToken = "08f3026d-9c6c-4d88-a3b2-c579dc106247";
// Configuration object for HTTP requests, including the Authorization header
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};

// Middleware to parse the body of HTTP POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Route handler for the root path to display a simple message
app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Waiting for data..." });
});

// Route to handle POST requests to retrieve a secret by ID
app.post("/get-secret", async (req, res) => {
  const searchId = req.body.id; // Extract the ID from the request body
  try {
    const result = await axios.get(API_URL + "/secrets/" + searchId, config); // Make a GET request to the API
    res.render("index.ejs", { content: JSON.stringify(result.data) }); // Render the result in the EJS template
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) }); // Handle errors
  }
});

// Route to handle POST requests to create a new secret
app.post("/post-secret", async (req, res) => {
  try {
    const result = await axios.post(API_URL + "/secrets", req.body, config); // Make a POST request to the API
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// Route to handle POST requests to update a secret by ID
app.post("/put-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.put(
      API_URL + "/secrets/" + searchId,
      req.body,
      config
    );
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// Route to handle PATCH requests to partially update a secret by ID
app.post("/patch-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.patch(
      API_URL + "/secrets/" + searchId,
      req.body,
      config
    );
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// Route to handle POST requests to delete a secret by ID
app.post("/delete-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.delete(API_URL + "/secrets/" + searchId, config);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
