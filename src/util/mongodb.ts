import { MongoClient, MongoClientOptions } from "mongodb";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
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

// 모듈 형태로 Connection을 형성한 client 객체를 내보내서
// 자원을 많이 소모하는 Connection 생성을 최소화한다.
// Spring 에서 DataSource 같은 개념?
export default clientPromise;
