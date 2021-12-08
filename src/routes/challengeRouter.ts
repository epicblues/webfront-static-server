import express from "express";
import {
  createChallenge,
  joinChallenge,
  likeChallenge,
} from "../controllers/challenge";

const router = express.Router();

router.post("/create", createChallenge);
router.post("/join", joinChallenge);
router.post("/like", likeChallenge);
router.patch("/like", likeChallenge);

export default router;
