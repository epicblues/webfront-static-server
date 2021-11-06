import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import imageRouter from "./routes/imageRouter";

const dotenvConfig = dotenv.config();
const app = express();
app.use(cors());
app.use(express.static("public"));
app.use("/image", imageRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("listening on port : " + PORT);
});
