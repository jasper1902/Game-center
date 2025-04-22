import { Server, Socket } from "socket.io";
import { DrawLine, Lobby, ConnectedUsers } from "../models/types";
import {
  handleTicTacToeMakeMove,
  ticTacToeDisconnect,
  ticTacToeResetGame,
  ticTacToJoinRoom,
} from "./games/tic-tac-toe";
import { handleAttack, handleHit, handlePlayerState } from "./games/battleship";
import {
  handleCanvasState,
  handleClear,
  handleDrawCursor,
  handleDrawLine,
} from "./games/draw";
import {
  handlePongBall,
  handlePongGameStatus,
  handlePongPaddle,
  handlePongScore,
} from "./games/pong";
import { connectFourReset, connectFourUpdateBoard, dropPiece } from "./games/connect-four";

export let lobby: Lobby = [];
export const connectedUsers: ConnectedUsers = {};
export const handleSocketConnections = (io: Server) => {
  io.on("connection", (socket) => {
    handleJoinRoom(socket, io);
    handleDisconnect(socket, io);
    handleKickUser(socket, io);

    //Battleship specific events
    handleAttack(socket);
    handleHit(socket);
    handlePlayerState(socket);

    // Draw specific events
    handleCanvasState(socket);
    handleDrawLine(socket);
    handleDrawCursor(socket);
    handleClear(socket, io);

    // Pong specific events
    handlePongBall(socket);
    handlePongPaddle(socket);
    handlePongScore(socket);
    handlePongGameStatus(socket);

    // Tic Tac Toe specific events
    handleTicTacToeMakeMove(socket, io);
    ticTacToeResetGame(socket, io);

    // connect four specific events
    dropPiece(socket, io);
    connectFourReset(socket, io);
    connectFourUpdateBoard(socket, io);
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

    ticTacToJoinRoom(game, roomId, socket, io);

    io.to(roomId).emit("update-user-list", connectedUsers[roomId]);
    socket.broadcast.emit("update-lobby-list", lobby);
    socket.to(roomId).emit("draw-get-canvas-state");
  });
}

function handleDisconnect(socket: Socket, io: Server) {
  socket.on("disconnect", () => {
    ticTacToeDisconnect(socket);

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
