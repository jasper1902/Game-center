import { create } from "zustand";

export type CellValue = "X" | "O" | null;
export type GameStatus = "waiting" | "playing" | "finished";
export type GameResult = "X" | "O" | "draw" | null;

type GameHistory = { x: number; o: number };

type Store = {
  playerSymbol: "X" | "O" | null;
  setPlayerSymbol: (playerSymbol: "X" | "O" | null) => void;
  board: CellValue[];
  setBoard: (board: CellValue[]) => void;
  currentPlayer: "X" | "O";
  setCurrentPlayer: (player: "X" | "O") => void;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  winner: GameResult;
  setWinner: (result: GameResult) => void;
  winningLine: number[] | null;
  setWinningLine: (line: number[] | null) => void;
  gameHistory: GameHistory;
  setGameHistory: (
    updater: ((prev: GameHistory) => GameHistory) | GameHistory
  ) => void;
};

export const useticTacToeStore = create<Store>()((set) => ({
  playerSymbol: null,
  setPlayerSymbol: (playerSymbol) => set({ playerSymbol }),
  board: Array(9).fill(null),
  setBoard: (board) => set({ board }),
  currentPlayer: "X",
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  gameStatus: "waiting",
  setGameStatus: (gameStatus) => set({ gameStatus }),
  winner: null,
  setWinner: (winner) => set({ winner }),
  winningLine: null,
  setWinningLine: (line) => set({ winningLine: line }),
  gameHistory: { x: 0, o: 0 },
  setGameHistory: (updater) =>
    set((state) => ({
      gameHistory: typeof updater === "function" ? updater(state.gameHistory) : updater,
    })),
}));
