import express from "express";
import axios from "axios";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = "d3e3929e762effd931a75ec790088405";  // Ensure this variable is set in your .env file
const latitude = 45.4231;
const longitude = -75.6831;
const url = "https://api.openweathermap.org/data/2.5/weather";

app.get("/", async (req, res) => {
    try {
        const weather = await axios.get(url, {
            params: {
                lat: latitude,
                lon: longitude,
                appid: apiKey
            }
        });
        console.log(weather.data);
        res.render("index", { weather: weather.data });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Error retrieving current weather data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
