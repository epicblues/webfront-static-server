import { RequestHandler } from "express";
import clientPromise from "../util/mongodb";

export const verifyEmail: RequestHandler = async (req, res) => {
  console.log(req.body);
  res.status(200).send("<h1>이메일 인증 완료!</h1>");
};
