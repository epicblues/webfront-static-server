import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import recipeRouter from "./routes/recipeRouter";
import diaryRouter from "./routes/diaryRouter";
import challengeRouter from "./routes/challengeRouter";
import { auth } from "./util/auth";

const app = express();
app.use(cors());
// 보안이 필요 없는 요청(단순한 img src)
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.use(express.static("public"));

// 보안이 필요한 요청 처리
app.use("/api", auth);
app.use("/api/recipe", recipeRouter);
app.use("/api/diary", diaryRouter);
app.use("/api/challenge", challengeRouter);

app.get("/", (req, res) => {
  // console.log(req);
  res.status(200).json({ message: "root page" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("listening on port : " + PORT);
});
