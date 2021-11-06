import express from "express";
import { main, upload } from "../controllers/image";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("./", "/public/static"));
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname);
  },
});
const router = express.Router();
const uploadMiddleware = multer({ storage });

router.get("/", main);

router.post("/post/:fileName", uploadMiddleware.array("images"), upload);

export default router;
