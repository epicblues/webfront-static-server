import { RequestHandler } from "express";

import clientPromise, {
  getNextSequence,
  uploadChatMessage,
} from "../util/mongodb";
import {
  getParsedFormData,
  resizeAndDeleteOriginalImg,
} from "../util/multipart";
import { logger } from "../util/logger";
import socket from "../util/socket";
import { LiveData } from "../models";
import { BSONType, PullOperator, PushOperator } from "mongodb";

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
        likes: [],
      });
    const message = new LiveData(
      "Admin",
      `${name}님이 ${challengeForm.title}챌린지를 준비했습니다!`
    );
    const io = await socket;
    await uploadChatMessage(message, client, io);
    res.status(200).json({ challengeForm, files });
  } catch (error) {
    res.status(404).json(error);
  }
};

export const joinChallenge: RequestHandler = async (req, res) => {
  if (req.method?.toUpperCase() !== "POST")
    return res.status(404).json({ message: "NO POST METHOD" });
  const { id: userId, name } = JSON.parse(req.headers.authorization as string);

  const challengeId = Number(req.query.id);
  try {
    const client = await clientPromise;
    const result = await client
      .db("webfront")
      .collection("challenge")
      .findOneAndUpdate(
        { _id: challengeId },
        {
          $push: {
            participants: userId,
          } as PushOperator<BSONType>,
        },
        {
          returnDocument: "after",
        }
      );
    const newMessage = new LiveData(
      "Admin",
      `${name}님이 ${result.value.title} 챌린지에 참여했습니다!`
    );
    const io = await socket;
    await uploadChatMessage(newMessage, client, io);

    // );
    res.status(200).json({ challenge: result.value });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const likeChallenge: RequestHandler = async (req, res) => {
  const { id: userId, name } = JSON.parse(req.headers.authorization as string);

  const challengeId = Number(req.query.id);
  const client = await clientPromise;
  if (req.method?.toUpperCase() === "POST") {
    try {
      const result = await client
        .db("webfront")
        .collection("challenge")
        .findOneAndUpdate(
          { _id: challengeId },
          {
            $push: {
              likes: userId,
            } as PushOperator<BSONType>,
          },
          {
            returnDocument: "after",
          }
        );
      const newMessage = new LiveData(
        "Admin",
        `${name}님이 ${result.value.title} 챌린지를 좋아합니다!`
      );
      const io = await socket;
      await uploadChatMessage(newMessage, client, io);

      // );
      res.status(200).json({ challenge: result.value });
    } catch (error) {
      res.status(404).json({ message: error });
    }
  } else if (req.method?.toUpperCase() === "PATCH") {
    try {
      const result = await client
        .db("webfront")
        .collection("challenge")
        .findOneAndUpdate(
          { _id: challengeId },
          {
            $pull: {
              likes: userId,
            } as PullOperator<BSONType>,
          },
          {
            returnDocument: "after",
          }
        );

      res.status(200).json({ challenge: result.value });
    } catch (error) {
      res.status(404).json({ message: error });
    }
  }
};
