import { RequestHandler } from "express";
import { MealType } from "../constants";
import { LiveData } from "../models";
import { logger } from "../util/logger";

import clientPromise from "../util/mongodb";

import {
  getParsedFormData,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";
import socket from "../util/socket";

export const updateDiary: RequestHandler = async (req, res) => {
  const { id: user_id, name } = JSON.parse(req.headers.authorization as string);
  res;
  try {
    const client = await clientPromise;
    const [error, fields, files] = await getParsedFormData(req);

    logger.info(fields);
    logger.info(files);
    const type = Number(fields.type[0]);
    const mealToUpdate = {
      foods: JSON.parse(fields.foods[0]),
      calories: Number(fields.calories[0]),
      fat: Number(fields.fat[0]),
      protein: Number(fields.protein[0]),
      carbs: Number(fields.carbs[0]),
      written: Boolean(fields.written[0] === "true" ? 1 : 0),
      image: files.image
        ? `/static/diary_${user_id}_${fields.upload_date[0]}_${type}.jpg`
        : (fields.image[0] === "null" ? null : fields.image[0]) || null, // 파일에 이미지가 없으면 사전에 등록된 이미지 필드가 있거나 아예 보내지 않은 경우
    };
    if (files.image) {
      const outputInfo = await resizeAndDeleteOriginalImg(
        files.image[0].path,
        `public${mealToUpdate.image}`.replace(/\.\w{3}$/, ".jpg")
      );

      logger.info(outputInfo);
    }

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
    logger.info(result);
    // 폼 데이터로 1~4개의 이미지가 온다.
    // 이미지에는 반드시 diary_userid_날짜_
    (await socket).emit(
      "message",
      new LiveData(
        "Admin",
        `${name}님이 ${MealType[type]} 다이어리를 작성하셨습니다!`
      )
    );
    res.status(200).json({ message: "createDiary" });
  } catch (error) {
    logger.error(error.message);
    res.status(404).json({ message: error });
  }
};
