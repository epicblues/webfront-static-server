import express from "express";
import { createRecipe } from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);

export default router;
