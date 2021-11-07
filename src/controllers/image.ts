import { RequestHandler } from "express";

export const main: RequestHandler = (req, res) => {
  res.status(200).json({ message: "This is image main page" });
};

export const upload: RequestHandler = (req, res) => {
  console.log(req.body);
  console.log(req.files);
  if (req.files) {
    return res.status(200).json({ status: "ok" });
  }
  res.status(404).json({ status: "error" });
};
