import http from "http";
import { Server } from "socket.io";

// Entry Point에서 생성한 sockerServer에 대한 다양한 이벤트 설치

let io: Server;

export const makeSocketServer = (server: http.Server) => {
  io = new Server(server, {
    path: "/chat",
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("user connected");
    socket.emit("message", {
      name: "Admin",
      message: "채팅창에 오신 것을 환영합니다!",
    });
    socket.on("chat", (message) => {
      console.log(message);
      io.emit("message", message); // 해당 io를 통해 연결된 모든 connection에게 메시지 전달
    });
  });

  io.on("close", () => {
    console.log("user closed");
  });
  return io;
};

export default io;
