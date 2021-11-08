import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";

export const createDiary: RequestHandler = (req, res) => {
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });
};
