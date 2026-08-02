# Study Notes: JSX and Babel

## Introduction to JSX

### What is JSX?

- **JSX** stands for **JavaScript XML**.
- It allows you to write HTML-like syntax directly in JavaScript, making it easier to describe the structure of the UI.
- JSX is not a requirement for React but is highly recommended due to its readability and simplicity.
- JSX code needs to be converted into regular JavaScript because browsers do not natively understand JSX. This is where Babel comes in.

### Example of JSX

```jsx
ReactDOM.render(<h1>Hello, World!</h1>, document.getElementById("root"));
```

- The code above is an example of JSX. It is then compiled to JavaScript that browsers can execute.

### How JSX is Compiled by Babel

- **Babel** is a JavaScript compiler that transforms JSX into regular JavaScript.
- The JSX code:

  ```jsx
  ReactDOM.render(<h1>Hello, World!</h1>, document.getElementById("root"));
  ```

  is transformed by Babel into:

  ```javascript
  ReactDOM.render(
    React.createElement("h1", null, "Hello, World!"),
    document.getElementById("root")
  );
  ```

- The `React.createElement` method takes three arguments:
  1. **Type**: The HTML tag or React component (e.g., `"h1"`).
  2. **Props**: The attributes or properties of the element (e.g., `null` if no attributes).
  3. **Children**: The content or child elements (e.g., `"Hello, World!"`).

### Why Use JSX?

- **Declarative**: Describes what the UI should look like rather than how to manipulate the DOM to achieve it.
- **Readable**: JSX syntax is more readable and maintainable compared to vanilla JavaScript.
- **Optimized Updates**: React uses a virtual DOM to update only the parts of the actual DOM that need to change, making it more efficient.

### JSX vs. Plain JavaScript

Without JSX, creating an element looks like this:

```javascript
var h1 = document.createElement("h1");
h1.innerHTML = "Hello, World!";
document.getElementById("root").appendChild(h1);
```

- As shown, vanilla JavaScript requires more steps to accomplish what can be done in one line with JSX.

## Using JavaScript Expressions in JSX

- JavaScript expressions can be embedded within JSX using curly braces `{}`.

Example:

```jsx
const userName = "Sir Edward He";
ReactDOM.render(<h1>Hello, {userName}!</h1>, document.getElementById("root"));
```

- `{userName}` is a JavaScript expression that gets evaluated and its result is embedded in the JSX.

## Components in React

- JSX is often used with **components**, which are reusable pieces of UI logic.
- Components can be either **class-based** or **function-based**.

### Example of a Functional Component

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

ReactDOM.render(<Welcome name="Sir Edward He" />, document.getElementById("root"));
```

- **`Welcome`** is a functional component that takes `props` (properties) as an argument and returns a JSX element.
- Components like `Welcome` can be reused with different `name` values.

## Introduction to Babel

### What is Babel?

- **Babel** is a JavaScript compiler that:
  - Transforms JSX into standard JavaScript code.
  - Allows you to use modern JavaScript features that may not be supported in all browsers by compiling them to compatible versions.

### Why Use Babel?

- **Compatibility**: Ensures that JSX and modern JavaScript features work in older browsers.
- **Tooling**: Many modern JavaScript tools and frameworks rely on Babel for seamless development.

## Key Benefits of Using JSX with Babel

1. **Cleaner Syntax**: JSX allows for a cleaner and more readable syntax compared to traditional JavaScript methods.
2. **Faster Development**: Writing UI components with JSX is quicker and easier.
3. **Better Maintenance**: Code written in JSX is easier to read, debug, and maintain.
4. **Browser Compatibility**: Babel ensures compatibility across different browsers.

## Conclusion

- **JSX** simplifies writing and maintaining React applications by allowing developers to write HTML-like syntax directly in JavaScript.
- **Babel** plays a crucial role in converting JSX into regular JavaScript, enabling compatibility with all browsers.
- Understanding how JSX and Babel work together will help in building efficient and scalable React applications.

---

## Cheat Sheet: JSX Syntax Rules

Quick-reference table of the rules that most often trip up beginners (and show up in exam questions).

| Rule | Description | Example |
|------|-------------|---------|
| **Single root element** | A JSX expression must return exactly **one** enclosing element. Wrap multiple siblings in a parent `<div>`, a `<React.Fragment>`, or the shorthand `<>...</>`. | `return (<><h1>A</h1><p>B</p></>);` |
| **`className` instead of `class`** | `class` is a reserved word in JavaScript, so JSX uses `className` to set the CSS class attribute. | `<div className="card">...</div>` |
| **camelCase event handlers & attributes** | DOM event attributes (`onclick`, `onchange`) and multi-word HTML attributes become camelCase in JSX. | `<button onClick={handleClick}>Click</button>` |
| **Curly braces `{}` for JS expressions** | Anything inside `{}` is evaluated as a JavaScript expression (variables, function calls, ternaries, `.map()`, etc.), not plain text. | `<h1>Hello, {userName}!</h1>` |
| **Self-closing tags** | Elements with no children **must** be self-closed with a trailing `/>`, even ones that aren't self-closing in HTML5 (like `<img>` or `<input>`). | `<img src="logo.png" />`, `<input type="text" />` |
| **`htmlFor` instead of `for`** | Like `class`, `for` is reserved in JS, so labels use `htmlFor`. | `<label htmlFor="email">Email</label>` |
| **Inline styles are objects** | The `style` attribute takes a JS object with camelCase CSS properties, not a CSS string. | `<h1 style={{ color: "blue" }}>Hi</h1>` |
| **Comments use JS syntax inside `{}`** | HTML comments (`<!-- -->`) don't work in JSX; wrap a JS comment in curly braces instead. | `{/* this is a JSX comment */}` |

### JSX-to-`createElement` Comparison

Every piece of JSX is just syntactic sugar for a call to `React.createElement(type, props, ...children)`. Babel performs this conversion automatically at build time.

```jsx
// Written as JSX
function Welcome(props) {
  return (
    <div className="welcome-box">
      <h1>Hello, {props.name}!</h1>
      <button onClick={() => alert("Hi!")}>Greet</button>
    </div>
  );
}
```

```javascript
// Compiled by Babel to plain JavaScript
function Welcome(props) {
  return React.createElement(
    "div",
    { className: "welcome-box" },
    React.createElement("h1", null, "Hello, ", props.name, "!"),
    React.createElement(
      "button",
      { onClick: () => alert("Hi!") },
      "Greet"
    )
  );
}
```

Key takeaways from the comparison above:

- **Lowercase tag names** (`"div"`, `"h1"`, `"button"`) compile to **string** arguments — React treats these as built-in HTML elements.
- **Uppercase component names** (e.g. `<Welcome />`) compile to a reference to the **function/class itself**, e.g. `React.createElement(Welcome, {...})`, which is how React knows to call your component instead of creating a DOM tag.
- JSX **attributes** become the second argument (the `props` object); JSX **children** become the remaining arguments.
- Nested JSX simply becomes nested `React.createElement()` calls — this is why deeply nested UI can produce deeply nested compiled output, and why JSX is preferred for readability.

### Where Babel Fits in the React Build Pipeline

Babel doesn't run in the browser — it runs as a **build-time** step, before your code is ever served to a user. A typical pipeline looks like this:

```text
Your .js/.jsx source (with JSX + modern ES syntax)
        │
        ▼
  Babel (transpiler)
   - Converts JSX  ->  React.createElement(...) calls
   - Converts modern JS (ES6+) -> browser-compatible JS (ES5) as needed
        │
        ▼
  Bundler (e.g. Webpack, used internally by react-scripts / Create React App)
   - Combines all modules into one or a few optimized bundle files
   - Handles assets (CSS, images, etc.)
        │
        ▼
  Plain JavaScript bundle
   - This is what actually ships to the browser
   - No JSX remains; only React.createElement calls and standard JS
```

- In a Create React App project (like this one, via `react-scripts`), Babel and Webpack are pre-configured behind the scenes — you never see or edit their configuration directly.
- This is also why **you cannot open a `.jsx`/JSX-containing file directly in a browser**: the browser only understands the *output* of this pipeline, not the JSX source.
- Because transpilation happens at build time, there is **zero runtime performance cost** for using JSX — by the time your code runs, it's already plain `React.createElement()` calls.