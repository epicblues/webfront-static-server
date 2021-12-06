import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient, LiveData } from "../models";
import fs from "fs";
import path from "path";

import {
  getParsedFormData,
  promisify,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";
import { logger } from "../util/logger";
import socket from "../util/socket";

export const createRecipe: RequestHandler = async (req, res) => {
  const { id: user_id, name } = JSON.parse(req.headers.authorization as string);
  try {
    const [error, fields, files] = await getParsedFormData(req);
    if (error) throw error;
    logger.info(files);
    logger.info(fields);
    const client = await clientPromise;
    const recipeId = await getNextSequence("recipe", client);

    for (let fileIndex in files) {
      const imageMetaData: ImageFile = files[fileIndex][0];
      const tempPath = imageMetaData.path;
      // const imageBinary = fs.readFileSync(tempPath);

      try {
        const outputInfo = await resizeAndDeleteOriginalImg(
          tempPath,
          path.join(
            "./",
            `public/static/recipe_${recipeId}_${imageMetaData.fieldName}.jpg`
          )
        );

        logger.info(outputInfo);
      } catch (error) {
        return res.status(500).json({ message: error });
      }
    }

    const stepData = JSON.parse(fields.stepData[0]);

    // step Name과 file을 순서대로 맞춰서 steps 배열에 삽입
    // 이미지 파일 이름 예상 : postId_순서
    const steps = stepData.map((step, index) => {
      return {
        desc: step.desc,
        image_url: `/static/recipe_${recipeId}_step_img_${index + 1}.jpg`,
      };
    });

    const ingredients: Ingredient[] = fields.igr_array[0]
      .split(",")
      .map((item: string): Ingredient => {
        return {
          food_id: Number(item.split("/")[0]),
          quantity: Number(item.split("/")[1]),
        };
      });

    const createResult = await client
      .db("webfront")
      .collection("recipe")
      .insertOne({
        _id: recipeId,
        user_id,
        upload_date: new Date(),
        title: fields.title[0],
        desc: fields.desc[0],
        hit: 0,
        category: fields.category[0],
        qtt: Number(fields.qtt[0]),
        duration: fields.duration[0],
        ingredients,
        steps, // image_url과 desc 탑재
        nutrition: JSON.parse(fields.totalNutrition[0]),
      });
    (await socket).emit(
      "message",
      new LiveData(
        "Admin",
        `${name} 님이 ${fields.title[0]} 레시피를 작성하셨습니다!`
      )
    );
    res.status(createResult.acknowledged ? 200 : 404).json({
      status: createResult.acknowledged ? createResult.insertedId : "failed",
    });
  } catch (error) {
    logger.error(error.message);
  }
};

export const deleteRecipe: RequestHandler = async (req, res) => {
  // req에 recipe_id를 읽는다.
  logger.info(req.body);
  const unlinkPromise = promisify(fs.unlink);
  try {
    const recipeId = req.body?.recipe_id;
    const client = await clientPromise;
    const { value: removedRecipe } = await client
      .db("webfront")
      .collection("recipe")
      .findOneAndDelete({ _id: recipeId });
    for (let step of removedRecipe.steps) {
      unlinkPromise(path.join("./", "public", step.image_url));
    }
    res.status(200).json({ message: removedRecipe });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateRecipe: RequestHandler = async (req, res) => {
  try {
    const [error, fields, files] = await getParsedFormData(req);
    if (error) throw error;
    logger.info(fields, files);

    const recipeId = Number(fields.recipe_id[0]);

    // 기존 이미지의 순서가 바뀌었을 경우 이미지 파일 이름 수정.
    const presentImageKeys = Object.keys(fields).filter((key) =>
      /step_img/.test(key)
    );
    presentImageKeys.forEach((key) => {
      if (key[key.length - 1] !== fields[key][fields[key].length - 5]) {
        fs.renameSync(
          path.join("./", "public" + fields[key][0]),
          path.join("./", `public/static/recipe_${recipeId}_${key}.jpg`)
        );
      }
    });
    // 이미지 작업(새로 들어온 이미지 등록)
    for (let fileIndex in files) {
      const imageMetaData: ImageFile = files[fileIndex][0];
      const tempPath = imageMetaData.path;

      try {
        const outputInfo = await resizeAndDeleteOriginalImg(
          tempPath,
          path.join(
            "./",
            `public/static/recipe_${recipeId}_${imageMetaData.fieldName}.jpg`
          )
        );
        logger.info(outputInfo);
      } catch (error) {
        return res.status(500).json({ message: error });
      }
    }

    const stepData = JSON.parse(fields.stepData[0]);

    // step Name과 file을 순서대로 맞춰서 steps 배열에 삽입
    // 이미지 파일 이름 예상 : postId_순서
    const steps = stepData.map((step, index) => {
      return {
        desc: step.desc,
        image_url: `/static/recipe_${recipeId}_step_img_${index + 1}.jpg`,
      };
    });

    for (
      let index = steps.length + 1;
      fs.existsSync(
        path.join(
          "./",
          `public/static/recipe_${recipeId}_step_img_${index}.jpg`
        )
      );
      index++
    ) {
      fs.rmSync(
        path.join(
          "./",
          `public/static/recipe_${recipeId}_step_img_${index}.jpg`
        )
      );
    }

    const ingredients: Ingredient[] = fields.igr_array[0]
      .split(",")
      .map((item: string): Ingredient => {
        return {
          food_id: Number(item.split("/")[0]),
          quantity: Number(item.split("/")[1]),
        };
      });
    const client = await clientPromise;
    const updateResult = await client
      .db("webfront")
      .collection("recipe")
      .updateOne(
        { _id: recipeId },
        {
          $set: {
            title: fields.title[0],
            desc: fields.desc[0],
            update_date: new Date(fields.update_date[0]),
            category: fields.category[0],
            qtt: Number(fields.qtt[0]),
            duration: fields.duration[0],
            ingredients,
            steps, // image_url과 desc 탑재
            nutrition: JSON.parse(fields.totalNutrition[0]),
          },
        }
      );
    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ message: "updated!" });
    }
  } catch (error) {
    logger.error(error.message);
  }
};
