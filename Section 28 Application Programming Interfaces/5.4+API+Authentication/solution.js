// Importing the required modules: express for server operations and axios for HTTP requests
import express from 'express';
import axios from 'axios';

// Initializing the express app
const app = express();
// Setting the port number for the server
const port = 3000;
// Base URL for the API
const API_URL = 'https://secrets-api.appbrewery.com';

// Placeholder variables for authentication values - replace these with your actual credentials before running
const yourUsername = '';
const yourPassword = '';
const yourAPIKey = '';
const yourBearerToken = '';

// Route to display a simple message on the home page
app.get('/', (req, res) => {
  res.render('index.ejs', { content: 'API Response.' });
});

// Route to fetch data from the API without any authentication
app.get('/noAuth', async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/random`);
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Route to fetch data using Basic Authentication
app.get('/basicAuth', async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/all?page=2`, {
      auth: {
        username: yourUsername,
        password: yourPassword,
      },
    });
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Route to fetch data using an API key as a query parameter
app.get('/apiKey', async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/filter`, {
      params: {
        score: 5,
        apiKey: yourAPIKey,
      },
    });
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Configuration for requests using Bearer Token Authentication
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};

// Route to fetch data using Bearer Token Authentication
app.get('/bearerToken', async (req, res) => {
  try {
    const result = await axios.get(`${API_URL}/secrets/2`, config);
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

// Starting the server and logging a message to the console
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
