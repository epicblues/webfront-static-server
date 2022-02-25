import axios from "axios";
import { MongoClient, MongoClientOptions } from "mongodb";
import { Server } from "socket.io";
import { LiveData } from "../models";
import { logger } from "./logger";

const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

client = new MongoClient(uri, options);
clientPromise = client.connect();

export async function getNextSequence(schemaName: string, client: MongoClient) {
  try {
    const result = await client
      .db("webfront")
      .collection("counters")
      .findOneAndUpdate(
        { _id: `${schemaName}id` },
        { $inc: { sequence_value: 1 } }
      );
    if (result.value) return result.value["sequence_value"];
    else throw new Error("시퀀스 입력 실패!!!");
  } catch (error) {
    logger.error(error.message);
  }
}

export async function uploadChatMessage(
  message: LiveData,
  client: MongoClient,
  socket: Server
) {
  try {
    await client.db("webfront").collection("chat").insertOne(message);
    socket.emit("message", message);
  } catch (error) {
    throw new Error(error.message);
  }
}

export const isFoodDbOutdated = async (): Promise<boolean> => {
  const client = await clientPromise;
  const myDbCount = await client
    .db("webfront")
    .collection("food")
    .countDocuments();

  const originalDb = await (
    await axios.get(
      "https://openapi.foodsafetykorea.go.kr/api/224d076b33e24e379060/I2790/json/1/1/CHNH_DT=20211026"
    )
  ).data;

  const originalDbCount = +originalDb["I2790"]["total_count"];
  return myDbCount !== originalDbCount;
};

// 모듈 형태로 Connection을 형성한 client 객체를 내보내서
// 자원을 많이 소모하는 Connection 생성을 최소화한다.
// Spring 에서 DataSource 같은 개념?
export default clientPromise;
