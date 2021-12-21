import http from "http";
import { Server } from "socket.io";
import { logger } from "./logger";
import clientPromise from "./mongodb";

// Entry Point에서 생성한 sockerServer에 대한 다양한 이벤트 설치

let io: Server;

export const makeSocketServer = (server: http.Server) => {
  io = new Server(server, {
    path: "/chat",
    cors: {
      origin: "*",
    },
  });
  io.on("connection", async (socket) => {
    const client = await clientPromise;
    // 첫 번째 접속에만 전체 메시지를 준다.
    const messages = await client
      .db("webfront")
      .collection("chat")
      .aggregate([
        {
          $sort: {
            date: -1,
          },
        },
        {
          $limit: 30,
        },
        {
          $project: { _id: 0 },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ])
      .toArray();
    socket.emit("message", messages);
    logger.info("user connected");
    socket.on("chat", async (message) => {
      await client
        .db("webfront")
        .collection("chat")
        .insertOne({ ...message, date: new Date() });
      // 메시지를 받고 db에 해당 메시지를 등록
      io.emit("message", message); // 해당 io에 연결된 모든 connection에게 메시지 전달
    });
  });

  io.on("close", () => {
    logger.info("Socket Closed");
  });
  return io;
};

export default new Promise<Server>((resolve, reject) => {
  // 해당 코드가 실행되는 시점은 자바스크립트 전역 컨텍스트가 pop 되고 나서다.
  // MicroTaskQueue에 등록되어 있다.
  // 즉, io가 구성(makeSocketServer())된 이후이기 때문에 undefined가 아니다.
  setTimeout(() => {
    resolve(io);
  }, 0);
});
