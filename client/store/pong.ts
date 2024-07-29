import { create } from "zustand";

type Store = {
  player: "PLAYER1" | "PLAYER2";
  setPlayer: (player: "PLAYER1" | "PLAYER2") => void;
  gameStatus: "WAIT" | "PLAYING";
  setGameStatus: (gameStatus: "WAIT" | "PLAYING") => void;
};

export const usePongStore = create<Store>()((set) => ({
  player: "PLAYER1",
  setPlayer: (player: "PLAYER1" | "PLAYER2") => set({ player }),
  gameStatus: "WAIT",
  setGameStatus: (gameStatus: "WAIT" | "PLAYING") => set({ gameStatus }),
}));
