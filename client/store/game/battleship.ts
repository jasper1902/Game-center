import { ShipType } from "@/components/Battleship/SelectShip";

import { create } from "zustand";

export type Cell = {
  ship: { hasShip: boolean; name?: string };
  attack: {
    received: boolean;
    hit: boolean;
    destroyed: { hit: boolean; name: string | null };
  };
  x: number;
  y: number;
};

const SHIP_COLORS: Record<string, string> = {
  CARRIER: "bg-orange-400",
  BATTLESHIP: "bg-amber-400",
  CRUISER: "bg-yellow-400",
  SUBMARINE: "bg-green-400",
  DESTROYER: "bg-red-400",
  DEFAULT: "bg-gray-400",
};

type Board = Cell[][];
const BOARD_SIZE = 10;

const initializeEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_SIZE }, (_, rowIndex) =>
    Array.from({ length: BOARD_SIZE }, (_, colIndex) => ({
      ship: { hasShip: false },
      attack: {
        received: false,
        hit: false,
        destroyed: { hit: false, name: null },
      },
      x: rowIndex,
      y: colIndex,
    }))
  );
};

type BattleshipStore = {
  ships: ShipType[];
  setShips: (
    ships: ShipType[] | ((prevShips: ShipType[]) => ShipType[])
  ) => void;
  selectedShip: ShipType;
  setSelectedShip: (selectedShip: ShipType) => void;
  shipOrientation: "vertical" | "horizontal";
  setShipOrientation: (shipOrientation: "vertical" | "horizontal") => void;
  board: Board;
  setBoard: (board: Board | ((prevBoard: Board) => Board)) => void;
  gameState: "PENDING" | "READY" | "STARTED" | "END" | "WAIT";
  setGameState: (
    state: "PENDING" | "READY" | "STARTED" | "END" | "WAIT"
  ) => void;

  isPlayerTurn: boolean;
  setPlayerTurn: (turn: boolean) => void;
  getShipColorClassName: (shipName: string) => string;
  highlightedCells: { x: number; y: number }[];
  setHighlightedCells: (highlightedCells: { x: number; y: number }[]) => void;
  otherPlayerState: "PENDING" | "READY" | "END" | "STARTED";
  setOtherPlayerState: (
    setOtherPlayerState: "PENDING" | "READY" | "END" | "STARTED"
  ) => void;
};

export const useBattleshipStore = create<BattleshipStore>((set, get) => ({
  ships: [
    { name: "CARRIER", size: 5 },
    { name: "BATTLESHIP", size: 4 },
    { name: "CRUISER", size: 3 },
    { name: "SUBMARINE", size: 3 },
    { name: "DESTROYER", size: 2 },
  ],
  setShips: (ships) =>
    set((state) => ({
      ships: typeof ships === "function" ? ships(state.ships) : ships,
    })),
  selectedShip: { name: "DESTROYER", size: 2 },
  setSelectedShip: (selectedShip: ShipType) => set({ selectedShip }),
  shipOrientation: "vertical",
  setShipOrientation: (shipOrientation: "vertical" | "horizontal") =>
    set({ shipOrientation }),
  board: initializeEmptyBoard(),
  setBoard: (board) =>
    set((state) => ({
      board: typeof board === "function" ? board(state.board) : board,
    })),
  gameState: "PENDING",
  setGameState: (state) => set({ gameState: state }),
  isPlayerTurn: false,
  setPlayerTurn: (turn) => set({ isPlayerTurn: turn }),
  getShipColorClassName: (shipName: string): string =>
    SHIP_COLORS[shipName] || SHIP_COLORS.DEFAULT,
  highlightedCells: [],
  setHighlightedCells: (highlightedCells) => set({ highlightedCells }),
  otherPlayerState: "PENDING",
  setOtherPlayerState: (otherPlayerState) => set({ otherPlayerState }),
}));
