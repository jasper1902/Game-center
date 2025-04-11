import { Socket } from "socket.io";

export function handlePongBall(socket: Socket) {
  socket.on("pong-ball", (roomId, ball) => {
    socket.to(roomId).emit("pong-ball", ball);
  });
}

export function handlePongPaddle(socket: Socket) {
  socket.on("pong-paddle", (roomId, { player1Y, player2Y }) => {
    const payload: { player1Y?: number; player2Y?: number } = {};
    if (typeof player1Y === "number") payload.player1Y = player1Y;
    if (typeof player2Y === "number") payload.player2Y = player2Y;
    socket.to(roomId).emit("pong-paddle", payload);
  });
}

export function handlePongScore(socket: Socket) {
  socket.on("pong-score", (roomId, { player1Score, player2Score }) => {
    socket.to(roomId).emit("pong-score", { player1Score, player2Score });
  });
}

export function handlePongGameStatus(socket: Socket) {
  socket.on("pong-game-status", (roomId, status) => {
    socket.to(roomId).emit("pong-game-status", status);
  });
}
