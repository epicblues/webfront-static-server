import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient, Recipe, Step } from "../models";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";

export const createRecipe: RequestHandler = async (req, res) => {
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });

  multiHandler.parse(req, async (error, fields, files) => {
    if (error) throw error;
    console.log(files);
    const client = await clientPromise;
    const recipeId = await getNextSequence("recipe", client);

    for (let fileIndex in files) {
      const imageMetaData: ImageFile = files[fileIndex][0];
      const tempPath = imageMetaData.path;
      // const imageBinary = fs.readFileSync(tempPath);
      fs.renameSync(
        tempPath,
        path.join(
          path.resolve("./"),
          `public/static/recipe_${recipeId}_${imageMetaData.fieldName}.${
            imageMetaData.originalFilename.split(".")[1]
          }`
        )
      );
    }

    const stepNames = fields.stepData[0].split(",") as [];
    // step Name과 file을 순서대로 맞춰서 steps 배열에 삽입
    // 이미지 파일 이름 예상 : postId_순서
    const steps = stepNames.map((desc: string, index: number) => {
      return {
        desc,
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
      });
    res.status(createResult.acknowledged ? 200 : 404).json({
      status: createResult.acknowledged ? createResult.insertedId : "failed",
    });
  });
};

export const deleteRecipe: RequestHandler = async (req, res) => {
  // req에 recipe_id를 읽는다.
  console.log(req.body);
  try {
    const recipeId = req.body?.recipe_id;
    const client = await clientPromise;
    const { value: removedRecipe } = await client
      .db("webfront")
      .collection("recipe")
      .findOneAndDelete({ _id: recipeId });
    for (let step of removedRecipe.steps) {
      fs.rmSync(path.join("./", "public", step.image_url));
    }
    res.status(200).json({ message: removedRecipe });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
