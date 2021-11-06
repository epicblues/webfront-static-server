import express from "express";
import { main } from "../controllers/image";

const router = express.Router();

router.get("/", main);
router.get("/post/:id", (req, res) => {
  // params : /:{param 이름}  vs query : ?key=value
  console.log(req.params.id);
  const id = req.params.id;
  res.status(200).json({ message: id });
});

export default router;
