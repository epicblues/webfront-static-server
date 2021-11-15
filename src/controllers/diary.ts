import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";

import path from "path";
import multiparty from "multiparty";

import { resizeAndDeleteOriginalImg } from "../util/image";

export const updateDiary: RequestHandler = async (req, res) => {
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });
  const client = await clientPromise;

  multiHandler.parse(req, async (error, fields, files) => {
    console.log(fields);
    console.log(files);
    const type = Number(fields.type[0]);
    const mealToUpdate = {
      foods: JSON.parse(fields.foods[0]),
      calories: Number(fields.calories[0]),
      fat: Number(fields.fat[0]),
      protein: Number(fields.protein[0]),
      carbs: Number(fields.carbs[0]),
      written: true,
      image: `/static/diary_${user_id}_${fields.upload_date[0]}_${type}.${
        files.image[0].originalFilename.split(".")[1]
      }`,
    };

    const outputInfo = await resizeAndDeleteOriginalImg(
      files.image[0].path,
      `public${mealToUpdate.image}`
    );

    console.log(outputInfo);

    const result = await client
      .db("webfront")
      .collection("diary")
      .findOneAndUpdate(
        { user_id, upload_date: fields.upload_date[0] },
        {
          $set: {
            [`meals.${type}`]: mealToUpdate,
          },
        }
      );
    console.log(result);
  });

  // 폼 데이터로 1~4개의 이미지가 온다.
  // 이미지에는 반드시 diary_userid_날짜_
  res.status(200).json({ message: "createDiary" });
};
