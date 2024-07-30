# Joke API

This is a simple RESTful API for managing jokes. The API allows you to create, read, update, and delete jokes, as well as filter jokes by type and delete all jokes using a master key.

## Getting Started

### Prerequisites

To run this project, you need to have Node.js and npm installed on your machine.

### Installing

1. Clone the repository:
    ```
    git clone https://github.com/your-username/joke-api.git
    ```
2. Navigate to the project directory:
    ```
    cd joke-api
    ```
3. Install the dependencies:
    ```
    npm install
    ```

### Running the Server

To start the server, run:
```
node index.js
```
The server will start on port 3000.

## API Endpoints

### 1. GET a Random Joke

- **Endpoint:** `/random`
- **Method:** GET
- **Description:** Retrieves a random joke.
- **Example Request:**
    ```
    GET /random
    ```
- **Example Response:**
    ```json
    {
        "id": 1,
        "jokeText": "Why did the scarecrow win an award? Because he was outstanding in his field.",
        "jokeType": "pun"
    }
    ```

### 2. GET a Specific Joke

- **Endpoint:** `/jokes/:id`
- **Method:** GET
- **Description:** Retrieves a joke by its ID.
- **Example Request:**
    ```
    GET /jokes/1
    ```
- **Example Response:**
    ```json
    {
        "id": 1,
        "jokeText": "Why did the scarecrow win an award? Because he was outstanding in his field.",
        "jokeType": "pun"
    }
    ```

### 3. GET Jokes by Filtering on the Joke Type

- **Endpoint:** `/filter`
- **Method:** GET
- **Description:** Retrieves jokes filtered by their type.
- **Example Request:**
    ```
    GET /filter?type=pun
    ```
- **Example Response:**
    ```json
    [
        {
            "id": 1,
            "jokeText": "Why did the scarecrow win an award? Because he was outstanding in his field.",
            "jokeType": "pun"
        }
    ]
    ```

### 4. POST a New Joke

- **Endpoint:** `/jokes`
- **Method:** POST
- **Description:** Adds a new joke.
- **Example Request:**
    ```json
    {
        "text": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "type": "pun"
    }
    ```
- **Example Response:**
    ```json
    {
        "id": 2,
        "jokeText": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "jokeType": "pun"
    }
    ```

### 5. PUT a Joke

- **Endpoint:** `/jokes/:id`
- **Method:** PUT
- **Description:** Replaces an existing joke with a new one.
- **Example Request:**
    ```json
    {
        "text": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "type": "pun"
    }
    ```
- **Example Response:**
    ```json
    {
        "id": 1,
        "jokeText": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "jokeType": "pun"
    }
    ```

### 6. PATCH a Joke

- **Endpoint:** `/jokes/:id`
- **Method:** PATCH
- **Description:** Updates an existing joke's text or type.
- **Example Request:**
    ```json
    {
        "text": "What do you get when you cross a snowman and a vampire? Frostbite."
    }
    ```
- **Example Response:**
    ```json
    {
        "id": 1,
        "jokeText": "What do you get when you cross a snowman and a vampire? Frostbite.",
        "jokeType": "pun"
    }
    ```

### 7. DELETE a Specific Joke

- **Endpoint:** `/jokes/:id`
- **Method:** DELETE
- **Description:** Deletes a joke by its ID.
- **Example Request:**
    ```
    DELETE /jokes/1
    ```
- **Example Response:**
    ```
    200 OK
    ```

### 8. DELETE All Jokes

- **Endpoint:** `/all`
- **Method:** DELETE
- **Description:** Deletes all jokes if the correct master key is provided.
- **Example Request:**
    ```
    DELETE /all?key=4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT
    ```
- **Example Response:**
    ```
    200 OK
    ```

## Code Summary

The API is built using Express and includes the following endpoints:

1. **GET /random:** Retrieves a random joke.
2. **GET /jokes/:id:** Retrieves a joke by its ID.
3. **GET /filter:** Retrieves jokes filtered by type.
4. **POST /jokes:** Adds a new joke.
5. **PUT /jokes/:id:** Replaces an existing joke with a new one.
6. **PATCH /jokes/:id:** Updates an existing joke's text or type.
7. **DELETE /jokes/:id:** Deletes a joke by its ID.
8. **DELETE /all:** Deletes all jokes if the correct master key is provided.

Each route handler processes the request, interacts with the `jokes` array, and sends an appropriate JSON response.

## Route Parameter Format

In the route `app.get("/jokes/:id", (req, res)`, the `:id` part of the URL specifies a route parameter. This means that whatever value is placed in the `:id` position in the URL will be accessible in the route handler via `req.params.id`. For example, a request to `/jokes/1` will make `req.params.id` equal to `1`.

## Example API Calls

Here are some example API calls for each route:

- **Get a random joke:**
    ```
    GET /random
    ```

- **Get a specific joke:**
    ```
    GET /jokes/1
    ```

- **Filter jokes by type:**
    ```
    GET /filter?type=pun
    ```

- **Add a new joke:**
    ```
    POST /jokes
    {
        "text": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "type": "pun"
    }
    ```

- **Replace a joke:**
    ```
    PUT /jokes/1
    {
        "text": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "type": "pun"
    }
    ```

- **Update a joke:**
    ```
    PATCH /jokes/1
    {
        "text": "What do you get when you cross a snowman and a vampire? Frostbite."
    }
    ```

- **Delete a specific joke:**
    ```
    DELETE /jokes/1
    ```

- **Delete all jokes:**
    ```
    DELETE /all?key=4VGP2DN-6EWM4SJ-N6FGRHV-Z3PR3TT
    ```

## Authors

- **Your Name** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
