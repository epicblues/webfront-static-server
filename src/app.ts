import dotenv from "dotenv";
dotenv.config();
import { logger } from "./util/logger";
import express from "express";
import cors from "cors";
import recipeRouter from "./routes/recipeRouter";
import diaryRouter from "./routes/diaryRouter";
import challengeRouter from "./routes/challengeRouter";
import userRouter from "./routes/userRouter";
import { auth } from "./util/auth";
import http from "http";
import { makeSocketServer } from "./util/socket";
import { isFoodDbOutdated } from "./util/mongodb";
import { sendDbOutdatedEmail } from "./util/email";

isFoodDbOutdated().then((isOutdated) => {
  if (isOutdated) {
    sendDbOutdatedEmail();
  }
});

const app = express();
app.use(cors());

// 보안이 필요 없는 요청(단순한 img src)
app.use((req, res, next) => {
  logger.info(`${req.method}, ${req.url} `);
  next();
});
app.get("/chat", (req, res) => {
  res.status(200).json({ status: "chat connected" });
});
app.use(express.static("public"));
app.use("/api/user", userRouter);
// 보안이 필요한 요청 처리
app.use("/api", auth);
app.use("/api/recipe", recipeRouter);
app.use("/api/diary", diaryRouter);
app.use("/api/challenge", challengeRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "root page" });
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
makeSocketServer(server);

server.listen(PORT, () => {
  console.log("listening on port : " + PORT);
});
