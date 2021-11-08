import { MongoClient, MongoClientOptions } from "mongodb";

declare module globalThis {
  let _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Hot Module Replacement(개발 중에 파일을 바꿨을 때 바뀐 내용을 새로고침 없이 브라우저에 반영하는 것?)를 위해 커넥션 객체를 전역 변수로 선언해서 연결을 유지시키도록 한다.
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  // 실제 배포 환경에서는 전역 변수로 사용하지 않는다.

  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

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
    throw error;
  }
}

// 모듈 형태로 Connection을 형성한 client 객체를 내보내서
// 자원을 많이 소모하는 Connection 생성을 최소화한다.
// Spring 에서 DataSource 같은 개념?
export default clientPromise;
