import express from "express";
import { main } from "../controllers/image";

const router = express.Router();

router.get("/", main);

export default router;
