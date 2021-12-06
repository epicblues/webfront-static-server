import { RequestHandler } from "express";

import clientPromise, { getNextSequence } from "../util/mongodb";
import {
  getParsedFormData,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";
import { logger } from "../util/logger";
import socket from "../util/socket";
import { LiveData } from "../models";

export const createChallenge: RequestHandler = async (req, res) => {
  const { id: userId, name } = JSON.parse(req.headers.authorization as string);

  try {
    const client = await clientPromise;
    const [error, fields, files] = await getParsedFormData(req);
    if (error) throw error;
    logger.info(fields);
    logger.info(files);
    const challengeId = await getNextSequence("challenge", client);
    const challengeForm: any = {};
    Object.keys(fields).forEach((key) => {
      challengeForm[key] = ["dateDiff", "userId"].includes(key)
        ? +fields[key][0]
        : fields[key][0];
    });
    // challenge_[chal_id].jpg;
    const imageName = `challenge_${challengeId}.${
      files.image[0].originalFilename.split(".")[1]
    }`;

    await resizeAndDeleteOriginalImg(
      files.image[0].path,
      `public/static/${imageName}`
    );
    // Diet Type
    if (challengeForm.type === "diet") {
      const dietChecker = [];
      for (let i = 0; i < challengeForm.dateDiff + 1; i++)
        dietChecker.push(false);
      challengeForm.diet = JSON.parse(challengeForm.diet);
      challengeForm.diet.checker = dietChecker;
    }

    // Recipe Type
    if (challengeForm.type === "recipe") {
      challengeForm.recipe = JSON.parse(challengeForm.recipe);
      challengeForm.recipe.checker = [];
    }

    await client
      .db("webfront")
      .collection("challenge")
      .insertOne({
        ...challengeForm,
        _id: challengeId,
        uploadDate: new Date(),
        startDate: new Date(challengeForm.startDate),
        endDate: new Date(challengeForm.endDate),
        userId,
        participants: [challengeForm.userId],
        winners: [],
        image: `/static/${imageName}`,
      });
    (await socket).emit(
      "message",
      new LiveData(
        "Admin",
        `${name}님이 ${challengeForm.title}챌린지를 준비했습니다!`
      )
    );
    res.status(200).json({ challengeForm, files });
  } catch (error) {
    res.status(404).json(error);
  }
};
