import express from "express";
import db from "../db/conn.mjs";

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
}); // Like a Recipe

// Delete liked recipe
router.delete("/savedRecipes/delete", async (req, res) => {
  try {
    // Extract the recipe ID and user ID from the request body
    const { user_id, recipe_id } = req.body;

    // Check if both user ID and recipe ID are provided
    if (!user_id || !recipe_id) {
      return res.status(400).send("Both user ID and recipe ID are required");
    }

    // Find and delete the liked recipe
    const collection = await db.collection("savedRecipes");
    const result = await collection.deleteOne({ _user_id: user_id, _recipe_id: recipe_id });

    // Check if the deletion was successful
    if (result.deletedCount === 1) {
      return res.status(200).send("Liked recipe deleted successfully");
    } else {
      throw new Error("Failed to delete liked recipe");
    }
  } catch (error) {
    console.error("Error deleting liked recipe:", error);
    return res.status(500).send("An error occurred while deleting liked recipe: " + error.message);
  }
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


