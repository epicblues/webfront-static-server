import express from "express";
import { createRecipe, deleteRecipe } from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);
router.post("/delete", deleteRecipe);

export default router;
