import { NextFunction, Request, RequestHandler, Response } from "express";
import { verify } from "jsonwebtoken";
import { logger } from "./logger";

// Api 요청에 대한 인증확인 미들웨어
export const auth: RequestHandler = (req: Request, res: Response, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);
  // Token이 유효한가
  try {
    const decoded = verify(token, process.env.UUID_SECRET as string);
    // 에러가 나지 않으면 유효한 토큰!
    // 서버에서 index로 활용할 유저 이메일을 리퀘스트에 심는다.
    logger.info("API 미들웨어 인증 성공");
    req.headers.authorization = JSON.stringify(decoded);

    return next();
  } catch (error) {
    // token이 없거나 유효하지 않은 경우
    // 401 status : 인증되지 않은 회원
    logger.info(error.message);
    res.status(401).json({ status: "no auth" });
    return;
  }
};

export const checkValid = (...strArray: string[]): boolean => {
  return strArray.filter((str) => str.trim().length === 0).length === 0;
};
