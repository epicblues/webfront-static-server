import bodyParser from "body-parser";
import express, { json } from "express";
import {
  createRecipe,
  deleteRecipe,
  likeRecipe,
  updateRecipe,
} from "../controllers/recipe";

const router = express.Router();

router.post("/create", createRecipe);
router.post("/delete", express.json(), deleteRecipe);
router.post("/update", updateRecipe);
router.post("/like", likeRecipe);
router.patch("/like", likeRecipe);

export default router;
