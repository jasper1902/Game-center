import http from "http";
import { Server, Socket } from "socket.io";
import app from "./api";
import { handleSocketConnections } from "./api/sockets/socketHandler";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

handleSocketConnections(io);

server.listen(PORT, () => {
  console.log(`✔️ Server listening on port ${PORT}`);
});
