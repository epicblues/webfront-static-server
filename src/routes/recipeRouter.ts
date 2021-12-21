import express, { json } from "express";
import {
  createRecipe,
  deleteRecipe,
  likeRecipe,
  updateRecipe,
} from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);
router.post("/delete", json(), deleteRecipe);
router.post("/update", updateRecipe);
router.post("/like", likeRecipe);
router.patch("/like", likeRecipe);

export default router;
