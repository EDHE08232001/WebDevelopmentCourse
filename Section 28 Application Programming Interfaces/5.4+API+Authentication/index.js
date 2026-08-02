import express from "express";
import axios from "axios";

// This file demonstrates 4 common ways APIs authenticate requests:
//   1. No Auth      - the endpoint is public, anyone can call it.
//   2. Basic Auth    - a username + password are sent with every request.
//   3. API Key       - a secret key issued to you is sent with every request
//                      (here, as a query parameter).
//   4. Bearer Token  - a token (often obtained after logging in) is sent in
//                      the Authorization header of every request.
const app = express();
const port = 3000;
const API_URL = "https://secrets-api.appbrewery.com/";

//TODO 1: Fill in your values for the 3 types of auth.
// IMPORTANT / SECURITY NOTE:
// These 4 variables are intentionally left BLANK for this course exercise -- you are
// expected to fill them in locally with your own test credentials while you practice.
// Never commit real usernames, passwords, API keys, or bearer tokens to source control
// (git), even in a private repo. Hardcoded secrets can leak through git history, forks,
// screen shares, or logs. For any real project, keep secrets out of your .js files
// entirely: store them in a local .env file (which you add to .gitignore so it's never
// committed), load them with the `dotenv` package, and read them via process.env, e.g.
//   import 'dotenv/config';
//   const yourUsername = process.env.USERNAME;
// If a credential was ever accidentally committed, treat it as compromised and rotate
// (regenerate/revoke and replace) it immediately, even after removing it from the code.
const yourUsername = "";
const yourPassword = "";
const yourAPIKey = "";
const yourBearerToken = "";

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "API Response." });
});

// STRATEGY 1: No Auth
// Some API endpoints are completely public and don't require any credentials at all --
// you just send a plain request and the server responds. This is the simplest (and least
// secure/least controlled) way an API can be exposed, usually reserved for read-only,
// non-sensitive data.
app.get("/noAuth", async (req, res) => {
  //TODO 2: Use axios to hit up the /random endpoint
  //The data you get back should be sent to the ejs file as "content"
  //Hint: make sure you use JSON.stringify to turn the JS object from axios into a string.

  try {
    const result = await axios.get(API_URL + "/random");
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send("Error: ", error.message);
  }
});

// STRATEGY 2: Basic Auth
// Basic auth sends a username and password with the request. When you pass axios an
// `auth: { username, password }` option (instead of manually building the header),
// axios automatically combines them as "username:password", base64-encodes that string,
// and attaches it as an `Authorization: Basic <base64string>` header under the hood.
// Note this is NOT encryption -- base64 is trivially reversible -- so basic auth should
// only ever be used over HTTPS, which encrypts the whole request in transit.
app.get("/basicAuth", async (req, res) => {
  //TODO 3: Write your code here to hit up the /all endpoint
  //Specify that you only want the secrets from page 2
  //HINT: This is how you can use axios to do basic auth:
  // https://stackoverflow.com/a/74632908
  /*
   axios.get(URL, {
      auth: {
        username: "abc",
        password: "123",
      },
    });
  */

  try {
    const result = await axios.get(API_URL + "/all?page=2", {
      // Passing `auth` here tells axios to build the base64-encoded
      // "Authorization: Basic ..." header for us automatically.
      auth: {
        username: yourUsername,
        password: yourPassword
      }
    });
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send("Error: ", error.message);
  }
});

// STRATEGY 3: API Key
// An API key is a unique token issued to you (often when you register for API access)
// that identifies and authorizes your application. Here it's sent as a query parameter
// (e.g. ?apiKey=xxxx) using axios's `params` option, which appends each key/value pair
// from the object onto the request URL as a query string. Some APIs instead expect the
// key in a custom header (e.g. "x-api-key") -- always check the API's documentation.
app.get("/apiKey", async (req, res) => {
  //TODO 4: Write your code here to hit up the /filter endpoint
  //Filter for all secrets with an embarassment score of 5 or greater
  //HINT: You need to provide a query parameter of apiKey in the request.

  try {
    const result = await axios.get(API_URL + "/filter", {
      // axios turns this `params` object into query string parameters:
      // .../filter?score=5&apiKey=<yourAPIKey>
      params: {
        score: 5,
        apiKey: yourAPIKey
      }
    });
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send("Error: ", error.message);
  }
});

// STRATEGY 4: Bearer Token
// A bearer token is a credential (often a long, signed string like a JWT) that is sent
// in the `Authorization` request header, prefixed with the word "Bearer". Whoever "bears"
// (holds/presents) the token is trusted and granted access -- hence the name. Unlike
// basic auth, no encoding/decoding of a username+password pair happens; the token itself
// is the credential, usually obtained once (e.g. after logging in) and then reused.
const config = {
  headers: { Autherization: `Bearer ${yourBearerToken}` }
};

app.get("/bearerToken", async (req, res) => {
  //TODO 5: Write your code here to hit up the /secrets/{id} endpoint
  //and get the secret with id of 42
  //HINT: This is how you can use axios to do bearer token auth:
  // https://stackoverflow.com/a/52645402
  /*
  axios.get(URL, {
    headers: { 
      Authorization: `Bearer <YOUR TOKEN HERE>` 
    },
  });
  */

  try {
    const result = await axios.get(API_URL + "/secrets/2", config);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.status(404).send("Error: ", error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
