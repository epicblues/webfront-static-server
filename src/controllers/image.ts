import { RequestHandler } from "express";
import { multiHandler } from "../routes/imageRouter";
import fs from "fs";
import { ImageFile } from "../models";
import path from "path";

export const main: RequestHandler = (req, res) => {
  res.status(200).json({ message: "This is image main page" });
};

export const upload: RequestHandler = (req, res) => {
  try {
    multiHandler.parse(req, (err, fields, files) => {
      console.log(files);
      if (err) throw err;
      const imageArray = files.images;
      for (let image of imageArray) {
        const imageMetaData: ImageFile = image;
        const tempPath = imageMetaData.path;
        fs.renameSync(
          tempPath,
          path.join("./", "public/static", imageMetaData.originalFilename)
        );
      }
      return res.status(200).json({ status: 200 });
    });
  } catch (error) {
    return res.status(500).json({ status: 500 });
  }
};
