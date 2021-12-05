import http from "http";
import { Server } from "socket.io";

// Entry Point에서 생성한 sockerServer에 대한 다양한 이벤트 설치

export const makeSocketServer = (server: http.Server) => {
  const io = new Server(server, {
    path: "/chat",
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.log("user connected");
    socket.emit("message", "hello world");
  });
  io.on("close", () => {
    console.log("user closed");
  });
  return io;
};
