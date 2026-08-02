// Import necessary libraries
import React from "react"; // React is a JavaScript library for building user interfaces
// NOTE: Even though `React` is never referenced explicitly below, this import is required
// whenever JSX is used in this file. Babel compiles every JSX tag (e.g. <h1>...</h1>) into a
// call to `React.createElement(...)`, so `React` must be in scope for the compiled code to run.
import ReactDOM from "react-dom"; // ReactDOM is a package that provides DOM-specific methods
// ReactDOM is the "glue" between React elements (created via JSX/createElement) and the actual
// browser DOM. It exposes `render()` (used here) which mounts/updates a React element inside a
// real DOM node.

// Deprecated way to import React in older versions (not needed with ES6 module syntax)
// var React = require("react"); // for JSX
// var ReactDOM = require("react-dom");

/* 
ReactDOM.render() is a method that controls what gets rendered on the web page.
It takes three arguments:

1. What to show: A React element, which is usually written in JSX. 
   JSX (JavaScript XML) allows us to write HTML-like syntax directly in JavaScript.
2. Where to show: A reference to a DOM element where the React element should be mounted.
3. An optional callback function that gets executed after the rendering is complete.
*/

// --- JSX DEMO #1: Rendering a simple, static JSX element to the DOM ---
// `<h1>Hello, World!</h1>` is JSX: it looks like HTML but is really JavaScript syntax sugar.
// Babel will transpile this tag into `React.createElement("h1", null, "Hello, World!")` before
// the browser ever sees it (see the detailed explanation and compiled output in the comment block
// below). This is the simplest possible JSX usage: a single element, no attributes, no dynamic data.
ReactDOM.render(<h1>Hello, World!</h1>, document.getElementById("root"));

/*
Explanation of JSX:

JSX stands for JavaScript XML, and it allows you to write HTML elements in JavaScript.
JSX is not natively understood by browsers. This is where Babel, a JavaScript compiler, comes in. 

Babel transforms (or "compiles") the JSX code into standard JavaScript code that browsers can understand.

For example, the line above:

ReactDOM.render(<h1>Hello, World!</h1>, document.getElementById("root"));

is converted by Babel into:

ReactDOM.render(
  React.createElement("h1", null, "Hello, World!"),
  document.getElementById("root")
);

The `React.createElement` method is used by React to create a new React element.
It takes three arguments:
1. The HTML tag name (like "h1" in this case).
2. The attributes or props of the element (like `null` since we have no attributes here).
3. The content or children of the element ("Hello, World!").
*/

/*
Benefits of using React and JSX:

- Declarative: Instead of manually manipulating the DOM using methods like `createElement`, `appendChild`, and `innerHTML`, 
  you can declare the UI in terms of what it should look like and let React handle the DOM updates.
- More readable: JSX makes it easier to write and understand the structure of your components.
- Optimized updates: React only updates the parts of the DOM that need to be changed, resulting in faster and more efficient rendering.
*/

/*
Without React and JSX, creating the same "Hello, World!" element would look like this in plain JavaScript:

// Create an HTML element
var h1 = document.createElement("h1");
// Set the inner content of the element
h1.innerHTML = "Hello, World!";
// Append the element to the DOM
document.getElementById("root").appendChild(h1);

As you can see, this approach involves more steps and is harder to maintain compared to the JSX example.
*/

// --- JSX DEMO #2: Embedding a JavaScript expression inside JSX ---
// Example of using JSX with JavaScript expressions:

// You can use JavaScript expressions inside JSX using curly braces {}
const userName = "Sir Edward He";
// `{userName}` is NOT a string literal — it is a JavaScript expression slot. Babel compiles this
// JSX into `React.createElement("h1", null, "Hello, ", userName, "!")`, i.e. the variable's value
// becomes one of the element's children, evaluated at render time (not baked in as static text).
// This line also calls ReactDOM.render() again on the same "root" node, so it replaces the DOM
// content produced by DEMO #1 above with this new element tree.
ReactDOM.render(<h1>Hello, {userName}!</h1>, document.getElementById("root"));

/*
In the example above, the `{userName}` is a JavaScript expression that gets evaluated,
and its result is embedded directly into the JSX. This allows us to dynamically change 
the content based on variables, functions, or any valid JavaScript expression.
*/

/*
JSX is often combined with components, which are reusable pieces of UI logic. 
Components can be either class-based or function-based (also known as functional components).

For example:

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

ReactDOM.render(<Welcome name="Sir Edward He" />, document.getElementById("root"));

Here, `Welcome` is a functional component that takes `props` (properties) as an argument 
and returns a JSX element. We can reuse `Welcome` component with different `name` values.
*/

// --- JSX DEMO #3 (conceptual, shown in the comment above): Custom components in JSX ---
// Note the capitalization rule: `<Welcome />` (capital "W") tells Babel/React this is a
// user-defined component, so it compiles to `React.createElement(Welcome, { name: "Sir Edward He" })`
// — passing the *function itself* as the type, not a string tag like "h1". Lowercase tags
// (`<h1>`, `<div>`) always compile to string type names and are treated as built-in HTML elements.
// The `name="Sir Edward He"` attribute becomes the `props` object (`{ name: "Sir Edward He" }`)
// received by the `Welcome` function, which is exactly how data flows from parent to child in React.
