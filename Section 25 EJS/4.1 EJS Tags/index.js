/*
EJS Tags
<%= variable %>                   JavaScript Output
<% JavaScript Code %>             JavaScript Execute
<%- <h1>Hello</h1> %>             Render HTML
<%% %%>                           for <% or %>
<&# This is a comment >           Stop Execution           
<%- include("FILE_NAME.ejs") %>   Insert another EJS file
*/

// Import the Express framework, used to create the web server and define routes.
import express from "express";

// Create an Express application instance. This object is used to configure
// middleware, routes, and the view engine, and to start the server.
const app = express();

// Port the local development server will listen on.
const port = 3000;

/**
 * GET /
 * Renders the home page using the "index.ejs" template (Express's default
 * views engine setup looks in the "views" folder, and EJS is auto-detected
 * because the "ejs" package is installed and files use the .ejs extension).
 *
 * The `data` object below is passed to the template as local variables,
 * meaning each key (title, seconds, items, htmlContent) can be referenced
 * directly inside index.ejs using EJS tags such as <%= title %>.
 */
app.get("/", (req, res) => {
  const data = {
    // Simple string used to demonstrate <%= %> output tags in the template.
    title: "EJS Tags",
    // Captures the current seconds value (0-59) at request time. Used in the
    // template to demonstrate conditional logic (e.g. odd/even checks) with <% %>.
    seconds: new Date().getSeconds(),
    // Array used to demonstrate looping over data with <% items.forEach(...) %>.
    items: ["apple", "banana", "cherry"],
    // Raw HTML string used to demonstrate the unescaped output tag <%- %>,
    // which renders HTML markup instead of escaping it to text.
    htmlContent: "<strong>This is some strong text</strong>",
  };
  // res.render compiles the EJS template with the given data and sends the
  // resulting HTML back to the client as the response.
  res.render("index.ejs", data);
});

// Start the HTTP server and listen for incoming requests on the given port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});