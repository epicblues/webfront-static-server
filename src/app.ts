import dotenv from "dotenv";
import express from "express";
import cors from "cors";

const dotenvConfig = dotenv.config();
const app = express();
app.use(express.static("public"));
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("listening on port : " + PORT);
});
