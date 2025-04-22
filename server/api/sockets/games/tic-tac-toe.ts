import { Server, Socket } from "socket.io";
type CellValue = "X" | "O" | null;
type GameStatus = "waiting" | "playing" | "finished";
type GameResult = "X" | "O" | "draw" | null;

interface Room {
  players: string[];
  board: CellValue[];
  currentPlayer: "X" | "O";
  status: GameStatus;
}

interface MakeMoveData {
  roomId: string;
  cellIndex: number;
  symbol: "X" | "O";
}

interface GameOverData {
  winner: GameResult;
  board: CellValue[];
}

interface MoveMadeData {
  board: CellValue[];
  currentPlayer: "X" | "O";
}

const rooms: Record<string, Room> = {};
const MAX_PLAYERS_PER_ROOM = 2;

function checkWinner(board: CellValue[]): GameResult {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export function handleTicTacToeMakeMove(socket: Socket, io: Server) {
  socket.on("TicTacToe-makeMove", ({ roomId, cellIndex, symbol }: MakeMoveData) => {
    const room = rooms[roomId];
    if (!room || room.status !== "playing" || room.currentPlayer !== symbol) {
      return;
    }

    if (room.board[cellIndex] === null) {
      room.board[cellIndex] = symbol;
      room.currentPlayer = symbol === "X" ? "O" : "X";

      const winner = checkWinner(room.board);
      if (winner) {
        room.status = "finished";
        io.to(roomId).emit("TicTacToe-gameOver", {
          winner,
          board: room.board,
        } as GameOverData);
      } else if (room.board.every((cell) => cell !== null)) {
        room.status = "finished";
        io.to(roomId).emit("TicTacToe-gameOver", {
          winner: "draw",
          board: room.board,
        } as GameOverData);
      } else {
        io.to(roomId).emit("TicTacToe-moveMade", {
          board: room.board,
          currentPlayer: room.currentPlayer,
        } as MoveMadeData);
      }
    }
  });
}

export function ticTacToJoinRoom(
  game: string,
  roomId: string,
  socket: Socket,
  io: Server
) {
  if (game === "TIC TAC TOE") {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        board: Array(9).fill(null),
        currentPlayer: "X",
        status: "waiting",
      };
    }

    if (rooms[roomId].players.length >= MAX_PLAYERS_PER_ROOM) {
      socket.emit("TicTacToe-roomFull");
      return;
    }

    rooms[roomId].players.push(socket.id);
    socket.join(roomId);

    const playerSymbol = rooms[roomId].players.length === 1 ? "X" : "O";
    socket.emit("TicTacToe-assignSymbol", playerSymbol);

    if (rooms[roomId].players.length === MAX_PLAYERS_PER_ROOM) {
      rooms[roomId].status = "playing";
      io.to(roomId).emit("TicTacToe-gameStart", rooms[roomId].board);
    }
  }
}

export function ticTacToeResetGame(socket: Socket, io: Server) {
  socket.on("TicTacToe-gameReset", (roomId: string) => {
    if (rooms[roomId]) {
      rooms[roomId].board = Array(9).fill(null);
      rooms[roomId].currentPlayer = "X";
      rooms[roomId].status = "playing";
      socket.emit("TicTacToe-gameReset");
      socket.emit("TicTacToe-gameStart", rooms[roomId].board);
      socket.to(roomId).emit("TicTacToe-gameReset");
      socket.to(roomId).emit("TicTacToe-gameStart", rooms[roomId].board);
    }
  });
}

export function ticTacToeDisconnect(socket: Socket) {
  for (const roomId in rooms) {
    rooms[roomId].players = rooms[roomId].players.filter(
      (id) => id !== socket.id
    );
    if (rooms[roomId].players.length === 0) {
      delete rooms[roomId];
    }
  }
}
