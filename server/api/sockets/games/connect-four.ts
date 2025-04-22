import { Server, Socket } from "socket.io";

export function dropPiece(socket: Socket, io: Server) {
  socket.on("connect-four-drop-piece", ({ roomId, col }) => {
    io.to(roomId).emit("connect-four-drop-piece", col);
  });
}

export function connectFourReset(socket: Socket, io: Server) {
  socket.on("connect-four-reset", ({ roomId }) => {
    io.to(roomId).emit("connect-four-reset");
  });
}

export function connectFourUpdateBoard(socket: Socket, io: Server) {
  socket.on("connect-four-board", ({ roomId, board }) => {
    io.to(roomId).emit("connect-four-board", board);
  });
}
