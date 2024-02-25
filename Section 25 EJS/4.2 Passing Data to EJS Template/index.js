import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
  const body = req.body;
  const numLetters = body.fName.length + body.lName.length;
  res.locals.numberOfLetters = numLetters;
  res.render("index.ejs");
  // The following also works
  // res.render("index.ejs", {numberOfLetters: numLetters})
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});