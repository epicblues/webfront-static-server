import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";
import fs from "fs";
import path from "path";

import {
  getParsedFormData,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";

export const createRecipe: RequestHandler = async (req, res) => {
  const { id: user_id } = JSON.parse(req.headers.authorization as string);
  const [error, fields, files] = await getParsedFormData(req);
  if (error) throw error;
  console.log(files);
  console.log(fields);
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
          path.resolve("./"),
          `public/static/recipe_${recipeId}_${imageMetaData.fieldName}.${
            imageMetaData.originalFilename.split(".")[1]
          }`
        )
      );

      console.log(outputInfo);
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
  res.status(createResult.acknowledged ? 200 : 404).json({
    status: createResult.acknowledged ? createResult.insertedId : "failed",
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

export const updateRecipe: RequestHandler = async (req, res) => {
  const [error, fields, files] = await getParsedFormData(req);
  if (error) throw error;
  console.log(fields, files);

  const recipeId = Number(fields.recipe_id[0]);
  const presentImageKeys = Object.keys(fields).filter((key) =>
    /step_img/.test(key)
  );
  presentImageKeys.forEach((key) => {
    if (key[key.length - 1] !== fields[key][fields[key].length - 5]) {
      fs.renameSync(
        path.join("./", fields[key][0]),
        path.join("./", `/static/recipe_${recipeId}_${key}.jpg`)
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
          path.resolve("./"),
          `public/static/recipe_${recipeId}_${imageMetaData.fieldName}.${
            imageMetaData.originalFilename.split(".")[1]
          }`
        )
      );
      console.log(outputInfo);
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
      path.join("./", `public/static/recipe_${recipeId}_step_img_${index}.jpg`)
    );
    index++
  ) {
    fs.rmSync(
      path.join("./", `public/static/recipe_${recipeId}_step_img_${index}.jpg`)
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
  // update에서 받아오는 것은 완전한 recipe 객체.
};
