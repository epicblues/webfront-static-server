import bodyParser from "body-parser";
import express, { json } from "express";
import { createRecipe, deleteRecipe } from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);
router.post("/delete", express.json(), deleteRecipe);

export default router;
