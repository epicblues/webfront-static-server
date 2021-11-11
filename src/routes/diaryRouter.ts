import express from "express";
import { updateDiary } from "../controllers/diary";

const router = express.Router();

router.post("/update", updateDiary);

export default router;
