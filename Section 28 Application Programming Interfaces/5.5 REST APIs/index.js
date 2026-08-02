import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://secrets-api.appbrewery.com";

// HINTs: Use the axios documentation as well as the video lesson to help you.
// https://axios-http.com/docs/post_example
// Use the Secrets API documentation to figure out what each route expects and how to work with it.
// https://secrets-api.appbrewery.com/

//TODO 1: Add your own bearer token from the previous lesson.
// SECURITY NOTE: yourBearerToken is intentionally left blank here for this course
// exercise -- fill it in locally with your own test token, but never commit real
// tokens/keys/passwords to source control. In a real project, store secrets like this
// in a local .env file (excluded from git via .gitignore), load it with the `dotenv`
// package, and read the value from process.env instead, e.g.:
//   import 'dotenv/config';
//   const yourBearerToken = process.env.BEARER_TOKEN;
// If a token is ever accidentally committed to git history, treat it as compromised
// and rotate (regenerate/revoke and replace) it right away.
const yourBearerToken = "";
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Waiting for data..." });
});

// GET (READ): retrieve an existing secret by id.
// Note this route is triggered by a POST form submission (for convenience of passing the
// id from an HTML form), but it performs a GET request to the API to READ/fetch data --
// the HTTP verb used against the *external* Secrets API is what matters for REST semantics,
// i.e. axios.get() below is the actual read operation.
app.post("/get-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.get(API_URL + "/secrets/" + searchId, config);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// POST (CREATE): create a brand-new secret on the server.
// axios.post(url, body, config) sends req.body as the new resource's data; the API
// assigns it a new id and returns the created resource.
app.post("/post-secret", async (req, res) => {
  // TODO 2: Use axios to POST the data from req.body to the secrets api servers.
  try {
    const result = await axios.post(API_URL + "/secrets", req.body, config);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

// PUT (REPLACE): completely replace an existing secret identified by searchId.
// PUT expects the FULL resource representation in the body -- any fields you omit are
// typically wiped out/reset, because the server treats the request body as the entire
// new version of the resource (unlike PATCH, which only updates the fields provided).
app.post("/put-secret", async (req, res) => {
  const searchId = req.body.id;
  // TODO 3: Use axios to PUT the data from req.body to the secrets api servers.
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

// PATCH (PARTIAL UPDATE): update only specific fields of an existing secret.
// Unlike PUT, PATCH only touches the fields included in req.body, leaving the rest of
// the existing resource untouched -- useful when you only want to change one property
// (e.g. just the secret text) without resending the whole object.
app.post("/patch-secret", async (req, res) => {
  const searchId = req.body.id;
  // TODO 4: Use axios to PATCH the data from req.body to the secrets api servers.
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

// DELETE (REMOVE): permanently remove the secret identified by searchId from the server.
// axios.delete() typically takes just the URL (and optionally a config object) since
// there's usually no body needed -- the id in the URL path is enough to identify what
// to remove.
app.post("/delete-secret", async (req, res) => {
  const searchId = req.body.id;
  // TODO 5: Use axios to DELETE the item with searchId from the secrets api servers.
  try {
    const result = await axios.delete(API_URL + "/secretes/" + searchId);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
