import express from "express";
import { createChallenge } from "../controllers/challenge";

const router = express.Router();

router.post("/create", createChallenge);

export default router;
