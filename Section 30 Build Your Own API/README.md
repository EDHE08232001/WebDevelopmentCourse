# Section 30 Notes

## What makes an API RESTful?

    1: HTTP Methods
        - GET
        - POST
        -  PUT
        - PATCH
        - DELETE

    2: JSON Output

    3: Client - Server
        - Client and server are separate
        - Client and server can scale up or down independently from each other

    4: Stateless
        - Each request can be complete and each request can be complete without knowing previous states
![image](./assets/statelessIllustration.png)

    5: Resource-Based
        - Uses universal resource identifier/locator

**Note:** Internet is considered one of the most successful implementations of the REST architecture

## Query vs Body

### Query Parameters

**Query parameters** are appended directly to the URL and do not require any special middleware to be sent. They are suitable for sending simple key-value pairs along with GET requests.

### Example:

1. **Server-side (Express):**
    ```javascript
    const express = require('express');
    const app = express();

    app.get("/search", (req, res) => {
      const keyword = req.query.keyword;  // Access query parameter
      res.send(`Search results for keyword: ${keyword}`);
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

2. **Client-side (Browser or Postman):**
    - **URL:**
      ```
      http://example.com/search?keyword=funny+jokes
      ```
    - You can also use a browser or Postman to send a GET request to the URL above.

### Request Body

**Request bodies** are used to send data with POST, PUT, and PATCH requests. This data is not visible in the URL and can include complex data structures. To handle request bodies in Express, you typically use middleware like `express.json()` to parse JSON request bodies.

### Sending request bodies requires a client-side library like Axios or Fetch API.

### Example:

1. **Server-side (Express):**
    ```javascript
    const express = require('express');
    const app = express();

    // Middleware to parse JSON bodies
    app.use(express.json());

    app.post("/jokes", (req, res) => {
      const newJoke = {
        id: jokes.length + 1,
        jokeText: req.body.text,  // Access data from request body
        jokeType: req.body.type,  // Access data from request body
      };
      jokes.push(newJoke);
      res.json(newJoke);
    });

    const jokes = [];
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

2. **Client-side (using Axios):**

    **Installation:**
    - First, you need to install Axios if you haven't already:
      ```sh
      npm install axios
      ```

    **Sending a POST request:**
    ```javascript
    const axios = require('axios');

    const newJoke = {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      type: "pun"
    };

    axios.post('http://example.com/jokes', newJoke)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    ```

3. **Client-side (using Fetch API):**

    **Sending a POST request:**
    ```javascript
    const newJoke = {
      text: "Why don't skeletons fight each other? They don't have the guts.",
      type: "pun"
    };

    fetch('http://example.com/jokes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newJoke)
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    ```

### Summary

- **Query Parameters**: 
  - Used with GET requests.
  - Sent directly in the URL.
  - No special middleware required for sending; can be sent using standard URL formatting.

- **Request Body**:
  - Used with POST, PUT, PATCH requests.
  - Sent in the body of the HTTP request.
  - Requires middleware like `express.json()` on the server side to parse JSON bodies.
  - Requires client-side libraries like Axios or Fetch API to send the body data.

Using query parameters and request bodies appropriately ensures that your application handles data efficiently and securely.
