/*
JS Object -> JSON: const jsonData = JSON.stringify(data);
JSON -> JS Object: const data = JSON.parse(jsonData);

JSON (JavaScript Object Notation) is a lightweight, text-based data format used to
exchange data between a client and a server (or between any two systems). APIs almost
always send and receive data as JSON strings, not as live JavaScript objects, because
JSON is just plain text that can travel over HTTP and be understood by any language.

- JSON.stringify(obj) converts a JS object/array into a JSON-formatted STRING so it can
  be sent over the network (e.g. as the body of an HTTP response) or stored in a file.
- JSON.parse(str) does the reverse: it takes a JSON-formatted STRING (e.g. one received
  from an API response) and converts it back into a usable JS object/array so we can
  access its properties with dot/bracket notation.
*/

import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

//Step 1: Run the solution.js file without looking at the code.
//Step 2: You can go to the recipe.json file to see the full structure of the recipeJSON below.
// recipeJSON below is sample data that stands in for what a real API would return:
// it is a JSON-formatted STRING (note the surrounding quotes) containing an array of
// taco objects, each with an id, type, name, price, and a nested ingredients object.
// Because it's still a string at this point, we must JSON.parse() it before we can
// access it like a normal JS array/object (see the POST "/recipe" route below).
const recipeJSON =
  '[{"id": "0001","type": "taco","name": "Chicken Taco","price": 2.99,"ingredients": {"protein": {"name": "Chicken","preparation": "Grilled"},  "salsa": {"name": "Tomato Salsa","spiciness": "Medium"},  "toppings": [{"name": "Lettuce",  "quantity": "1 cup",  "ingredients": ["Iceberg Lettuce"]  },      {"name": "Cheese",  "quantity": "1/2 cup",  "ingredients": ["Cheddar Cheese", "Monterey Jack Cheese"]  },      {"name": "Guacamole",  "quantity": "2 tablespoons",  "ingredients": ["Avocado", "Lime Juice", "Salt", "Onion", "Cilantro"]  },      {"name": "Sour Cream",  "quantity": "2 tablespoons",  "ingredients": ["Sour Cream"]  }      ]    }  },{"id": "0002","type": "taco","name": "Beef Taco","price": 3.49,"ingredients": {"protein": {"name": "Beef","preparation": "Seasoned and Grilled"},  "salsa": {"name": "Salsa Verde","spiciness": "Hot"},  "toppings": [{"name": "Onions",  "quantity": "1/4 cup",  "ingredients": ["White Onion", "Red Onion"]  },      {"name": "Cilantro",  "quantity": "2 tablespoons",  "ingredients": ["Fresh Cilantro"]  },      {"name": "Queso Fresco",  "quantity": "1/4 cup",  "ingredients": ["Queso Fresco"]  }      ]    }  },{"id": "0003","type": "taco","name": "Fish Taco","price": 4.99,"ingredients": {"protein": {"name": "Fish","preparation": "Battered and Fried"},  "salsa": {"name": "Chipotle Mayo","spiciness": "Mild"},  "toppings": [{"name": "Cabbage Slaw",  "quantity": "1 cup",  "ingredients": [    "Shredded Cabbage",    "Carrot",    "Mayonnaise",    "Lime Juice",    "Salt"          ]  },      {"name": "Pico de Gallo",  "quantity": "1/2 cup",  "ingredients": ["Tomato", "Onion", "Cilantro", "Lime Juice", "Salt"]  },      {"name": "Lime Crema",  "quantity": "2 tablespoons",  "ingredients": ["Sour Cream", "Lime Juice", "Salt"]  }      ]    }  }]';

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// `data` holds the currently selected recipe (as a JS object, not a JSON string) so it
// can be shared between the POST route (which sets it) and the GET route (which renders it).
let data;

// GET "/" simply renders the homepage with whatever recipe is currently stored in `data`.
// On first load `data` is undefined, so the page starts with no recipe selected.
app.get("/", (req, res) => {
  res.render("index.ejs", { recipe: data });
});

app.post("/recipe", (req, res) => {
  //Step 3: Write your code here to make this behave like the solution website.
  //Step 4: Add code to views/index.ejs to use the recieved recipe object.
  // The form on the page submits which taco the user picked (e.g. "chicken", "beef", "fish")
  // as req.body.choice, thanks to the bodyParser.urlencoded middleware above.
  let selectedChoice = req.body.choice;
  // The switch statement acts like the routing logic an API server might use: based on the
  // string value of selectedChoice, we JSON.parse() the recipeJSON string (turning it into
  // a real JS array) and pick out the matching recipe object by its array index.
  switch (selectedChoice) {
    case "chicken":
      // Index 0 of the parsed array is the Chicken Taco object.
      data = JSON.parse(recipeJSON)[0];
      break;
    case "beef":
      // Index 1 of the parsed array is the Beef Taco object.
      data = JSON.parse(recipeJSON)[1];
      break;
    case "fish":
      // Index 2 of the parsed array is the Fish Taco object.
      data = JSON.parse(recipeJSON)[2];
      break;
    default:
      // If the choice doesn't match any known recipe, do nothing and keep `data` as-is.
      break
  }
  // After updating `data`, redirect back to "/" so the GET route above re-renders the
  // page with the newly selected recipe (this is the Post/Redirect/Get pattern).
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
