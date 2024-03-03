import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to the determined port
app.listen(port, () => {
    console.log(`App is up at port ${port}`);
});