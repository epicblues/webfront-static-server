import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";

export const createDiary: RequestHandler = async (req, res) => {
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });

  multiHandler.parse(req, (error, fields, files) => {
    console.log(fields);
    console.log(files);
  });

  // 폼 데이터로 1~4개의 이미지가 온다.
  // 이미지에는 반드시 diary_userid_날짜_
  res.status(200).json({ message: "createDiary" });
};
