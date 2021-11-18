import bodyParser from "body-parser";
import express, { json } from "express";
import {
  createRecipe,
  deleteRecipe,
  updateRecipe,
} from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);
router.post("/delete", express.json(), deleteRecipe);
router.post("/update", updateRecipe);

export default router;
