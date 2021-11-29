import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import { ImageFile, Ingredient } from "../models";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";
import {
  getParsedFormData,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";
import { logger } from "../util/logger";

export const createChallenge: RequestHandler = async (req, res) => {
  const { id: userId } = JSON.parse(req.headers.authorization as string);

  try {
    const client = await clientPromise;
    const [error, fields, files] = await getParsedFormData(req);
    if (error) throw error;
    logger.info(fields);
    logger.info(files);
    // const challengeId = await getNextSequence("challenge", client);
    // const challengeForm = req.body;
    // // challenge_[chal_id].jpg;
    // const imageName = `challenge_${challengeId}.jpg`;

    // await resizeAndDeleteOriginalImg(
    //   files.image[0].path,
    //   `/public/static/${imageName}`
    // );
    // // Diet Type
    // if (challengeForm.type === "diet") {
    //   const dietChecker = [];
    //   for (let i = 0; i < challengeForm.dateDiff + 1; i++)
    //     dietChecker.push(false);
    //   challengeForm.diet.checker = dietChecker;
    // }

    // // Recipe Type
    // if (challengeForm.type === "recipe") {
    //   challengeForm.recipe.checker = [];
    // }

    // await client
    //   .db("webfront")
    //   .collection("challenge")
    //   .insertOne({
    //     ...challengeForm,
    //     _id: challengeId,
    //     uploadDate: new Date(),
    //     startDate: new Date(challengeForm.startDate),
    //     endDate: new Date(challengeForm.endDate),

    //     participants: [challengeForm.userId],
    //     winners: [],
    //     image: `/static/${imageName}`,
    //   });

    res.status(200).json({ fields, files });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};
