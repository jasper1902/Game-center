import { Socket } from "socket.io";

export function handleAttack(socket: Socket) {
  socket.on(
    "battleship-attack",
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
      handleEvent(socket, "battleship-attacked", roomId, {
        colIndex,
        rowIndex,
        username,
        hit,
      });
    }
  );
}

export function handleHit(socket: Socket) {
  socket.on(
    "battleship-hit",
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
      handleEvent(socket, "battleship-hit", roomId, { colIndex, rowIndex, hit, shipName });
    }
  );
}

export function handlePlayerState(socket: Socket) {
  socket.on("battleship-player-state", (roomId: string, state: string) => {
    handleEvent(socket, "battleship-player-state", roomId, state);
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
  