import { Server, Socket } from "socket.io";
import { DrawLine, Lobby, ConnectedUsers } from "../models/types";

export let lobby: Lobby = [];
export const connectedUsers: ConnectedUsers = {};

export const handleSocketConnections = (io: Server) => {
  io.on("connection", (socket) => {
    handleJoinRoom(socket, io);
    handleDisconnect(socket, io);
    handleCanvasState(socket);
    handleDrawLine(socket);
    handleDrawCursor(socket);
    handleClear(socket, io);
    handlePongBall(socket);
    handlePongPaddle(socket);
    handlePongScore(socket);
    handlePongGameStatus(socket);
    handleKickUser(socket, io);
    handleAttack(socket);
    handleHit(socket);
    handlePlayerState(socket);
  });
};

function handleJoinRoom(socket: Socket, io: Server) {
  socket.on("join-room", (roomId, username, game) => {
    socket.join(roomId);
    if (!connectedUsers[roomId]) {
      const newUser = { id: socket.id, username: username, host: true };
      connectedUsers[roomId] = [newUser];
      lobby.push({ game, roomId: roomId, host: username, user: [newUser] });
    } else {
      const newUser = { id: socket.id, username: username, host: false };
      connectedUsers[roomId].push(newUser);
      const roomLobby = lobby.find((item) => item.roomId === roomId);
      if (roomLobby) {
        roomLobby.user.push(newUser);
      }
    }
    io.to(roomId).emit("update-user-list", connectedUsers[roomId]);
    socket.broadcast.emit("update-lobby-list", lobby);
    socket.to(roomId).emit("get-canvas-state");
  });
}

function handleDisconnect(socket: Socket, io: Server) {
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in connectedUsers) {
      const roomUsers = connectedUsers[roomId];
      const userIndex = roomUsers.findIndex((user) => user.id === socket.id);
      if (userIndex !== -1) {
        roomUsers.splice(userIndex, 1);
        if (roomUsers.length === 0) {
          delete connectedUsers[roomId];
          lobby = lobby.filter((item) => item.roomId !== roomId);
        } else {
          const roomLobby = lobby.find((item) => item.roomId === roomId);
          if (roomLobby) {
            roomLobby.user = roomLobby.user.filter(
              (user) => user.id !== socket.id
            );
          }
        }
        io.to(roomId).emit("update-user-list", connectedUsers[roomId]);
        socket.broadcast.emit("update-lobby-list", lobby);
      }
    }
  });
}

function handleCanvasState(socket: Socket) {
  socket.on("canvas-state", (state, roomId) => {
    console.log("received canvas state");
    socket.to(roomId).emit("canvas-state-from-server", state);
  });
}

function handleDrawLine(socket: Socket) {
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

function handleDrawCursor(socket: Socket) {
  socket.on("draw-cursor", ({ x, y, color, username, roomId, lineWidth }) => {
    socket.to(roomId).emit("draw-cursor", { x, y, color, username, lineWidth });
  });
}

function handleClear(socket: Socket, io: Server) {
  socket.on("clear", (roomId) => {
    io.in(roomId).emit("clear");
  });
}

function handlePongBall(socket: Socket) {
  socket.on("pong-ball", (roomId, ball) => {
    socket.to(roomId).emit("pong-ball", ball);
  });
}

function handlePongPaddle(socket: Socket) {
  socket.on("pong-paddle", (roomId, { player1Y, player2Y }) => {
    const payload: { player1Y?: number; player2Y?: number } = {};
    if (typeof player1Y === "number") payload.player1Y = player1Y;
    if (typeof player2Y === "number") payload.player2Y = player2Y;
    socket.to(roomId).emit("pong-paddle", payload);
  });
}

function handlePongScore(socket: Socket) {
  socket.on("pong-score", (roomId, { player1Score, player2Score }) => {
    socket.to(roomId).emit("pong-score", { player1Score, player2Score });
  });
}

function handlePongGameStatus(socket: Socket) {
  socket.on("pong-game-status", (roomId, status) => {
    socket.to(roomId).emit("pong-game-status", status);
  });
}

function handleKickUser(socket: Socket, io: Server) {
  socket.on(
    "kick-user",
    (roomId: string, socketIdToKick: string, username: string) => {
      const roomUsers = connectedUsers[roomId];
      const hostUsername = lobby.find((i) => i.roomId === roomId)?.host;
      if (!roomUsers || hostUsername !== username) {
        return;
      }
      const userToKick = roomUsers.find((user) => user.id === socketIdToKick);
      if (userToKick) {
        io.to(socketIdToKick).emit(
          "kick",
          "You have been kicked from the room."
        );
        io.sockets.sockets.get(socketIdToKick)?.disconnect(true);
      }
    }
  );
}

function handleAttack(socket: Socket) {
  socket.on(
    "attack",
    (
      roomId: string,
      data: {
        colIndex: number;
        rowIndex: number;
        username: string;
        hit: boolean;
      }
    ) => {
      const { colIndex, rowIndex, username, hit } = data;
      handleEvent(socket, "attacked", roomId, {
        colIndex,
        rowIndex,
        username,
        hit,
      });
    }
  );
}

function handleHit(socket: Socket) {
  socket.on(
    "hit",
    (
      roomId: string,
      data: {
        colIndex: number;
        rowIndex: number;
        hit: boolean;
        shipName: string;
      }
    ) => {
      const { colIndex, rowIndex, hit, shipName } = data;
      handleEvent(socket, "hit", roomId, { colIndex, rowIndex, hit, shipName });
    }
  );
}

function handlePlayerState(socket: Socket) {
  socket.on("player-state", (roomId: string, state: string) => {
    handleEvent(socket, "player-state", roomId, state);
  });
}

function handleEvent(
  socket: Socket,
  event: string,
  roomId: string,
  payload: any
) {
  socket.to(roomId).emit(event, payload);
}
