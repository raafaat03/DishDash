import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import * as RecipeAPI from "./recipe-api";
import { PrismaClient } from "@prisma/client";

const app = express();
const prismaClient = new PrismaClient();

app.use(express.json());
app.use(cors());

// Define types for the query parameters
interface SearchRecipesQuery {
  searchTerm: string;
  page: string; // Express query params are always strings
}

// Public route: Search recipes
app.get("/api/recipes/search", async (req: Request<{}, {}, {}, SearchRecipesQuery>, res: Response) => {
  const searchTerm = req.query.searchTerm;
  const page = parseInt(req.query.page);

  if (!searchTerm || isNaN(page)) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const results = await RecipeAPI.searchRecipes(searchTerm, page);
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops, something went wrong" });
  }
});

// Public route: Get recipe summary
app.get("/api/recipes/:recipeId/summary", async (req: Request<{ recipeId: string }>, res: Response) => {
  const recipeId = req.params.recipeId;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    const results = await RecipeAPI.getRecipeSummary(recipeId);
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops, something went wrong" });
  }
});

interface FavouriteRecipeBody {
  recipeId: number;
}

// Route: Add a recipe to favourites
app.post("/api/recipes/favourite", async (req: Request<{}, {}, FavouriteRecipeBody>, res: Response) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    const favouriteRecipe = await prismaClient.favouriteRecipes.create({
      data: {
        recipeId: recipeId,
      },
    });
    return res.status(201).json(favouriteRecipe);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops, something went wrong" });
  }
});

// Route: Get favourite recipes
app.get("/api/recipes/favourite", async (req: Request, res: Response) => {
  try {
    const recipes = await prismaClient.favouriteRecipes.findMany();
    const recipeIds = recipes.map((recipe: { recipeId: number }) => recipe.recipeId.toString());

    const favourites = await RecipeAPI.getFavouriteRecipesByIDs(recipeIds);

    return res.json(favourites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops, something went wrong" });
  }
});

// Route: Remove a recipe from favourites
app.delete("/api/recipes/favourite", async (req: Request<{}, {}, FavouriteRecipeBody>, res: Response) => {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    await prismaClient.favouriteRecipes.deleteMany({
      where: {
        recipeId: recipeId,
      },
    });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops, something went wrong" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
