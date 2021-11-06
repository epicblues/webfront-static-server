import { RequestHandler } from "express";

export const main: RequestHandler = (req, res) => {
  res.status(200).json({ message: "This is file Router main page" });
};
