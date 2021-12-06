import express from "express";
import { createChallenge, joinChallenge } from "../controllers/challenge";

const router = express.Router();

router.post("/create", createChallenge);
router.post("/join", joinChallenge);

export default router;
