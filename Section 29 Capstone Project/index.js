// Express: minimal web framework used to define routes, configure the view
// engine, and start the HTTP server.
import express from "express";
// axios: promise-based HTTP client used here to call the OpenWeatherMap REST
// API from the server side.
import axios from "axios";
// path: Node.js built-in module for working with file/directory paths in a
// cross-platform way.
import path from 'path';
// fileURLToPath: converts the ES module's `import.meta.url` (a file:// URL)
// into a normal filesystem path string.
import { fileURLToPath } from 'url';

// EDUCATIONAL NOTE - __dirname in ES Modules:
// In CommonJS (require/module.exports), Node.js automatically provides
// `__filename` and `__dirname` for every module. However, in native ES
// Modules (using `import`/`export`, as enabled by "type": "module" in
// package.json), these globals do NOT exist. We must reconstruct them
// manually:
//   1. `import.meta.url` gives us the current module's location as a
//      file:// URL string (e.g. "file:///Users/.../index.js").
//   2. `fileURLToPath` converts that URL into a normal OS file path.
//   3. `path.dirname` then strips the filename, leaving just the directory.
// We need __dirname below so that Express can locate the "views" and
// "public" folders using an absolute path, regardless of the directory the
// app happens to be started from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Tell Express where to find the EJS templates and which templating engine
// to use to render them.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Serve static assets (CSS, client-side JS, images) from the "public" folder.
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
// SECURITY WARNING - DO NOT HARDCODE REAL API KEYS IN SOURCE CODE
// The string below is a real-looking OpenWeatherMap API key committed
// directly into this file. This is a bad practice for several reasons:
//   1. Anyone with access to this source code (or its Git history, even if
//      later removed) can read and misuse the key.
//   2. If this repository is ever made public or pushed to GitHub, the key
//      is exposed to the entire internet and can be scraped by bots within
//      minutes.
//   3. It couples the app's configuration to its code, making it hard to
//      use different keys per environment (dev/staging/prod) without
//      editing code.
// The correct approach is to load secrets from environment variables using
// a package like `dotenv`:
//   1. npm install dotenv
//   2. Create a ".env" file (and add it to .gitignore!) containing:
//        OPENWEATHER_API_KEY=your_real_key_here
//   3. At the top of this file: import 'dotenv/config';
//   4. Replace the hardcoded string with: const apiKey = process.env.OPENWEATHER_API_KEY;
// IMPORTANT: Because this key has already been committed to source control,
// it must be treated as COMPROMISED. Rotate/regenerate a new key at
// https://openweathermap.org/ (or your provider's dashboard) and revoke this
// one, even after switching to environment variables.
// ==========================================================================
const apiKey = "d3e3929e762effd931a75ec790088405";  // Ensure this variable is set in your .env file
const latitude = 45.4231;
const longitude = -75.6831;
const url = "https://api.openweathermap.org/data/2.5/weather";

// GET "/" - Home page route.
// Marked `async` so we can use `await` inside it to pause execution until
// the HTTP request to the OpenWeatherMap API resolves.
app.get("/", async (req, res) => {
    try {
        // axios.get(url, { params: {...} }) performs a GET request and
        // automatically serializes the `params` object into a query string,
        // e.g. "?lat=45.4231&lon=-75.6831&appid=<apiKey>".
        const weather = await axios.get(url, {
            params: {
                lat: latitude,
                lon: longitude,
                appid: apiKey
            }
        });
        console.log(weather.data);
        // Render the "index" EJS template, passing the API's response body
        // (weather.data) as the `weather` local variable used inside the view.
        res.render("index", { weather: weather.data });
    } catch (error) {
        // try/catch around the awaited axios call handles both network
        // failures and non-2xx HTTP responses (axios rejects on error status
        // codes). We log the API's own error payload when available
        // (error.response?.data) or fall back to the generic error message,
        // then respond with a 500 so the client knows the request failed.
        console.error(error.response?.data || error.message);
        res.status(500).send('Error retrieving current weather data');
    }
});

// Starts the HTTP server and begins listening for incoming requests on the
// specified port.
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
