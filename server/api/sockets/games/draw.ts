import { Server, Socket } from "socket.io";
import { DrawLine } from "../../models/types";

export function handleCanvasState(socket: Socket) {
  socket.on("draw-canvas-state", (state, roomId) => {
    socket.to(roomId).emit("draw-canvas-state-from-server", state);
  });
}

export function handleDrawLine(socket: Socket) {
  socket.on(
    "draw-line",
    ({
      prevPoint,
      currentPoint,
      color,
      roomId,
      lineWidth,
    }: DrawLine & { roomId: string }) => {
      socket
        .to(roomId)
        .emit("draw-line", { prevPoint, currentPoint, color, lineWidth });
    }
  );
}

export function handleDrawCursor(socket: Socket) {
  socket.on("draw-cursor", ({ x, y, color, username, roomId, lineWidth }) => {
    socket.to(roomId).emit("draw-cursor", { x, y, color, username, lineWidth });
  });
}

export function handleClear(socket: Socket, io: Server) {
  socket.on("draw-clear", (roomId) => {
    io.in(roomId).emit("draw-clear");
  });
}
