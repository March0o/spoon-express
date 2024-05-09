import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/users/login", async (req, res) => {
  try {
    const { name, password } = req.query;
    const collection = await db.collection("users");
    const query = { _name: name, _password: password };

    const result = await collection.findOne(query);

    if (!result) {
      res.status(401).send("No Users Found With Matching Credentials");
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("An error occurred while logging in");
  }
}); // Log-In

router.post("/users/signup", async (req, res) => {
  try {
    const newUser = req.body; // Assuming the request body contains user data
    const collection = await db.collection("users");
    
    // Check if user already exists
    const existingUser = await collection.findOne({ _name: newUser._name });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    // Insert the new user
    const result = await collection.insertOne(newUser);
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).send("An error occurred while signing up user");
  }
}); // Sign-Up

router.post("/savedRecipes/add", async (req, res) => {
  try {
    // Extract data from request body
    const { _user_id, _recipe_id, _recipe_name, _recipe_thumbnail } = req.body;

    // Basic validation to ensure required fields are provided
    if (!_user_id || !_recipe_id || !_recipe_name || !_recipe_thumbnail) {
      return res.status(400).send("All fields are required");
    }

    // Construct document to insert into collection
    const newSavedRecipe = {
      _user_id,
      _recipe_id,
      _recipe_name,
      _recipe_thumbnail
    };

    // Insert document into collection
    const collection = await db.collection("savedRecipes");
    const result = await collection.insertOne(newSavedRecipe);

    // Check if the insertion was successful
    if (result.acknowledged && result.insertedId) {
      return res.status(201).send("Saved recipe added successfully");
    } else {
      throw new Error("Failed to add saved recipe");
    }
  } catch (error) {
    console.error("Error adding saved recipe:", error);
    return res.status(500).send("An error occurred while adding saved recipe: " + error.message);
  }
});







// Delete a liked recipe
router.delete("/:id", async (req, res) => {
  let id=req.params.id
  //id=id.slice(1) //remove the colon at the start 

  const query = { _id: ObjectId(id) };

  const collection = db.collection("savedRecipes");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

router.post("/savedRecipes", async (req, res) => {
  try {
    const { _user_id } = req.body;
    if (!_user_id) {
      return res.status(400).send("User ID is required");
    }

    const collection = await db.collection("savedRecipes");
    const query = { _user_id };
    const results = await collection.find(query).toArray();
    
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching saved recipes by user ID:", error);
    res.status(500).send("An error occurred while fetching saved recipes by user ID");
  }
}); // Get Liked Recipes For User

export default router;


