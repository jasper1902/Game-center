import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";

type Player = "red" | "yellow";
type Cell = Player | null;
export type Board = Cell[][];
type GameStatus = "playing" | "won" | "draw" | 'wait';

interface GameState {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player;
  player: Player | null;
  setPlayer: (player: Player | null) => void;
  gameStatus: GameStatus;
  setGameStatus: (gameStatus: GameStatus) => void;
  winningCells: [number, number][];
  dropPiece: (col: number) => void;
  resetGame: () => void;
}

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = (): Board =>
  Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const isBoardFull = (board: Board): boolean =>
  board.every((row) => row.every((cell) => cell !== null));

const checkWin = (
  board: Board,
  row: number,
  col: number,
  player: Player
): [number, number][] => {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down-right
    [1, -1], // diagonal down-left
  ];

  for (const [dx, dy] of directions) {
    const winningCells: [number, number][] = [[row, col]];

    for (let i = 1; i < 4; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === player
      ) {
        winningCells.push([newRow, newCol]);
      } else {
        break;
      }
    }

    for (let i = 1; i < 4; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === player
      ) {
        winningCells.push([newRow, newCol]);
      } else {
        break;
      }
    }

    if (winningCells.length >= 4) {
      return winningCells;
    }
  }

  return [];
};

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  setBoard: (board: Board) => set({ board }),
  currentPlayer: "red",
  player: null,
  setPlayer: (player: Player | null) => set({ player }),
  gameStatus: "wait",
  setGameStatus: (gameStatus: GameStatus) => set({ gameStatus }),
  winningCells: [],

  dropPiece: (col: number) => {
    const { board, currentPlayer, gameStatus } = get();
    if (gameStatus !== "playing") return;

    const newBoard = board.map((row) => [...row]);
    let row = -1;

    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === null) {
        row = r;
        newBoard[r][col] = currentPlayer;
        break;
      }
    }

    if (row === -1) return; // column full

    const win = checkWin(newBoard, row, col, currentPlayer);

    if (win.length >= 4) {
      set({
        board: newBoard,
        gameStatus: "won",
        winningCells: win,
      });
      toast({
        title: "Winner!",
        description:
          currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + " wins the game!",
      });
    } else if (isBoardFull(newBoard)) {
      set({
        board: newBoard,
        gameStatus: "draw",
      });
      toast({
        title: "Game Over",
        description: "The game ended in a draw!",
      });
    } else {
      set({
        board: newBoard,
        currentPlayer: currentPlayer === "red" ? "yellow" : "red",
      });
    }
  },

  resetGame: () => {
    set({
      board: createEmptyBoard(),
      currentPlayer: "red",
      gameStatus: "playing",
      winningCells: [],
    });
  },
}));
