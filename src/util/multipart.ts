import { Request } from "express";
import multiparty from "multiparty";
import path from "path";

// 2개 이상의 매개변수를 요구하는 콜백에는 util.promisify가 적용되지 않는다.
// 사용자 정의 promisify
export const promisify =
  (fn) =>
  (...args) =>
    new Promise((resolve) => fn(...args, (...a: any[]) => resolve(a)));

export const getParsedFormData = async (req: Request): Promise<any[]> => {
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });

  // 새로운 함수 인스턴스 생성
  // 따라서 기존 메서드 내부의 this 바인딩이 깨지기 때문에 bind를 호출해서 묶어줘야 한다.
  const parsePromise = promisify(multiHandler.parse.bind(multiHandler));
  try {
    const parsedData = (await parsePromise(req)) as any[];
    return parsedData;
  } catch (error) {
    throw error;
  }
};

import sharp from "sharp";
import fs from "fs";

export const resizeAndDeleteOriginalImg = async (
  originalPath: string,
  outputPath: string
) => {
  try {
    await sharp(originalPath)
      .resize(640, 480)
      .withMetadata()
      .toFile(outputPath);
    fs.unlinkSync(originalPath);
  } catch (error) {
    throw error.message;
  }
};
