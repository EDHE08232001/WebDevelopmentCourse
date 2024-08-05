import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "edwardhe",
  host: "localhost",
  database: "visited_countries",
  password: "edward0823",
  port: "5432",
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });

  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const result = await db.query("SELECT country FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(result.rows);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
  });
  db.end();
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    /*
    SELECT country_code FROM countries: This part of the query selects the country_code column from the countries table.

    WHERE LOWER(country_name) LIKE '%' || $1 || '%':
      This part of the query filters the rows in the countries table based on a condition applied to the country_name column.
    
    LOWER(country_name): This function converts the country_name column value to lowercase.
    This ensures that the search is case-insensitive. For example, if the country_name is "Canada",
    it will be converted to "canada".

    
    */
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  '%' || $1 || '%';",
      [input]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try adding a different country",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
