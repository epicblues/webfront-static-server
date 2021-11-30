import bodyParser from "body-parser";
import express, { json } from "express";
import { verifyEmail } from "../controllers/user";

const router = express.Router();

router.post("/auth", verifyEmail);

export default router;
