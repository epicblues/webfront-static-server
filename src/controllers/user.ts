import { RequestHandler } from "express";
import { logger } from "../util/logger";
import clientPromise from "../util/mongodb";

export const verifyEmail: RequestHandler = async (req, res) => {
  logger.info(req.query);
  const email = req.query.email;
  const key = req.query.key;
  try {
    const client = await clientPromise;
    const result = await client
      .db("webfront")
      .collection("user")
      .findOneAndUpdate(
        {
          email,
          key,
        },
        {
          $set: { verified: true },
        }
      );
    logger.info(result.value);
    res.status(200).send("<h1>이메일 인증 완료!</h1>");
  } catch (error) {
    res.status(404).send("<H1>이메일 인증 실패!</H1>");
  }
};
