// Import necessary modules from npm packages
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Create an Express application
const app = express();
const port = 3000;

// Middleware to serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Route handler for the home page to display a random activity.
 * It fetches the activity using the Bored API and renders it using the index.ejs template.
 */
app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://bored-api.appbrewery.com/random");
    const result = response.data;
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", { error: error.message });
  }
});

/**
 * POST route handler for filtering activities based on user input.
 * It fetches data from the Bored API using the provided 'type' and 'participants'.
 * It randomly selects one activity to display if the API call is successful.
 * In case of an error or if no matching activities are found, it displays an error message.
 */
app.post("/", async (req, res) => {
  try {
    const { type, participants } = req.body;
    const response = await axios.get(`https://bored-api.appbrewery.com/filter?type=${type}&participants=${participants}`);
    const result = response.data;
    if (result.length > 0) {
      console.log("\nRAW RESPONSE:");
      console.log(response);
      console.log("\nRESPONSE.DATA:");
      console.log(result);
      res.render("index.ejs", { data: result[Math.floor(Math.random() * result.length)] });
    } else {
      throw new Error("No matching activities found.");
    }
  } catch (error) {
    console.error("Failed to make a request:", error.message);
    res.render("index.ejs", { error: "No Activities that Match Your Criteria!!!" });
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
