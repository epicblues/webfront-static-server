import Http from "http";
import multiparty from "multiparty";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

type ParsedFormData = {
  fields: any;
  files: any;
};

export const getParsedFormData = async (
  req: Http.IncomingMessage
): Promise<ParsedFormData> => {
  const multiHandler = new multiparty.Form({
    uploadDir: path.join("./", "public/static"),
  });

  try {
    const parsedData = await new Promise<ParsedFormData>((resolve, reject) => {
      multiHandler.parse(req, (error, fields, files) => {
        if (error) {
          reject(error);
        } else {
          resolve({ fields, files });
        }
      });
    });
    return parsedData;
  } catch (error) {
    throw error;
  }
};

export const resizeAndDeleteOriginalImg = async (
  originalPath: string,
  outputPath: string
) => {
  try {
    await sharp(originalPath)
      .resize(640, 480)
      .withMetadata()
      .toFile(outputPath);
    fs.unlink(originalPath);
  } catch (error) {
    throw error;
  }
};
