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
    console.log(file);
    cb(null, file.filename);
  },
});
const router = express.Router();
const uploadMiddleware = multer({ storage });

// 사실상 멀터 미들웨어가 요청을 처리하기 전에 파일들을 옮겨 놓는다?

router.get("/", main);

router.post("/post/:fileName", uploadMiddleware.array("images"), upload);

export default router;
