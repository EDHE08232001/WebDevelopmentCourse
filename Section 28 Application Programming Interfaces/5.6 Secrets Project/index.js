// HINTS:
// 1. Import express and axios
import express from "express";
import axios from "axios";

// 2. Create an express app and set the port number.
const app = express();
const port = 3000;

// 3. Use the public folder for static files.
// express.static("public") tells Express to automatically serve any file inside the
// "public" folder (CSS, images, client-side JS, etc.) directly to the browser when
// requested by path, e.g. a request for "/styles/main.css" is served from
// "public/styles/main.css" without needing an explicit route for it.
app.use(express.static("public"));

// 4. When the user goes to the home page it should render the index.ejs file.
// 5. Use axios to get a random secret and pass it to index.ejs to display the
// secret and the username of the secret.
// This route is async because axios.get() returns a Promise -- awaiting it pauses this
// function until the Secrets API responds, without blocking the rest of the server.
app.get("/", async (req, res) => {
    try {
        // No auth needed here: "/random" is a public (no-auth) endpoint on the Secrets API
        // that returns one randomly chosen secret object, e.g. { secret, username }.
        const result = await axios.get("https://secrets-api.appbrewery.com/random");
        // Pull just the fields the view needs (the secret text and the author's username)
        // out of result.data and pass them to the EJS template to be displayed.
        res.render("index.ejs", { secret: result.data.secret, user: result.data.username });
    } catch (error) {
        // If the request fails (network issue, API error, etc.), log the API's error
        // details and respond with a 500 Internal Server Error status instead of crashing.
        console.log(error.response.data);
        res.status(500);
    }
});

// 6. Listen on your predefined port and start the server.
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
