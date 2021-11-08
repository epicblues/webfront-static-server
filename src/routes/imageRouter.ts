import express from "express";
import { main, upload } from "../controllers/image";

import path from "path";
import multiparty from "multiparty";

const router = express.Router();

export const multiHandler = new multiparty.Form({
  uploadDir: path.join("./", "public/static"),
});

// 사실상 멀터 미들웨어가 요청을 처리하기 전에 파일들을 옮겨 놓는다?

router.get("/", main);

router.post("/post/:fileName", upload);

export default router;
