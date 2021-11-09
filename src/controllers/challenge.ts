import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";

export const createChallenge: RequestHandler = async (req, res) => {
  // 폼 데이터로 오지 않을 가능성 존재
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });

  res.status(200).json({ message: "createChallenge" });
};
