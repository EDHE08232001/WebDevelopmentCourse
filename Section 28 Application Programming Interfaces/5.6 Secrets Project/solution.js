// Import necessary modules: Express for creating the server and Axios for making HTTP requests
import express from "express";
import axios from "axios";

// Initialize the Express application
const app = express();
// Define the port on which the server will listen
const port = 3000;

// Middleware to serve static files like images, CSS files, and JavaScript files located in the 'public' directory
app.use(express.static("public"));

// Route handler for the root path
app.get("/", async (req, res) => {
  try {
    // Making an HTTP GET request using Axios to retrieve a random secret from the specified URL
    const result = await axios.get("https://secrets-api.appbrewery.com/random");
    // Render the page using the EJS template engine. The 'index.ejs' will display data obtained from the API.
    res.render("index.ejs", {
      secret: result.data.secret,    // Pass the secret data from the API to the EJS template
      user: result.data.username,    // Pass the username associated with the secret to the EJS template
    });
  } catch (error) {
    // Log any errors that occur during the fetching of data
    console.log(error.response.data);
    // Send a 500 Internal Server Error status if an error occurs
    res.status(500);
  }
});

// Start the server on the specified port and log a message to the console to confirm it is running
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
