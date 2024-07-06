import { Server } from "socket.io";

const initSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("broadcast-message", (message) => {
      console.log("Received broadcast message:", message);
      io.emit("broadcast-message", message);
    });
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return { io };
};

export { initSocketServer };