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
