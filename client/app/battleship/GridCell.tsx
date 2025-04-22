import React, { useCallback, useEffect, useState } from "react";
import { Cell, useBattleshipStore } from "@/store/game/battleship";

interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  cell: Cell;
  isCellHighlighted: boolean;
  onHover: (row: number, col: number) => void;
  shipOrientation: "vertical" | "horizontal";
  hasShip: boolean;
}
const SHIP_COLORS: Record<string, string> = {
  CARRIER: "bg-orange-400",
  BATTLESHIP: "bg-amber-400",
  CRUISER: "bg-yellow-400",
  SUBMARINE: "bg-green-400",
  DESTROYER: "bg-red-400",
  DEFAULT: "bg-gray-400",
};
const getShipColorClassName = (shipName: string): string =>
  SHIP_COLORS[shipName] || SHIP_COLORS.DEFAULT;

const GridCell: React.FC<GridCellProps> = ({
  rowIndex,
  colIndex,
  cell,
  isCellHighlighted,
  onHover,
  shipOrientation,
  hasShip,
}) => {
  const {
    setShips,
    selectedShip,
    setSelectedShip,
    setBoard,
    gameState,
    setGameState,
    board,
    highlightedCells,
  } = useBattleshipStore();

  const [color, setColor] = useState("bg-gray-400");

  useEffect(() => {
    let newColor = "bg-gray-400";

    if (isCellHighlighted) {
      newColor = getShipColorClassName(selectedShip?.name);
    }
    if (cell.ship.hasShip && cell.ship.name) {
      newColor = getShipColorClassName(cell.ship.name);
    }

    const exceedsBoundary = highlightedCells.some(
      (cell) => cell.x > 9 || cell.y > 9
    );

    if (exceedsBoundary) {
      const matchingCell = highlightedCells.find(
        (cell) => cell.x === colIndex && cell.y === rowIndex
      );

      if (matchingCell) {
        newColor = "bg-red-900";
      }
    }
    if (cell.attack.received) {
      newColor = "bg-stone-800";
    }
    setColor(newColor);
  }, [cell.attack.received, cell.ship.hasShip, cell.ship.name, colIndex, highlightedCells, isCellHighlighted, rowIndex, selectedShip?.name]);

  // Function to place ship on board
  const placeShip = (rowIdx: number, colIdx: number, shipName: string) => {
    setBoard((prevBoard) => {
      return prevBoard.map((row, rIdx) =>
        row.map((col, cIdx) =>
          rIdx === rowIdx && cIdx === colIdx
            ? { ...col, ship: { hasShip: true, name: shipName } }
            : col
        )
      );
    });
  };

  // Handle ship placement logic
  const handleShipPlacement = () => {
    if (!selectedShip) return;

    for (let i = 0; i < selectedShip.size; i++) {
      if (shipOrientation === "horizontal") {
        placeShip(rowIndex, colIndex + i, selectedShip.name);
      } else if (shipOrientation === "vertical") {
        placeShip(rowIndex + i, colIndex, selectedShip.name);
      }
    }

    setShips((prevShips) => {
      const newShips = prevShips.filter(
        (ship) => ship.name !== selectedShip.name
      );
      setSelectedShip(newShips[0] || null);

      if (newShips.length <= 0) {
        setGameState("READY");
      }

      return newShips;
    });
  };

  // Handle cell click event
  const handleCellClick = () => {
    try {
      if (!isCellHighlighted || gameState !== "PENDING") return;

      const shipHasConflict = Array(selectedShip.size)
        .fill(null)
        .some((_, index) => {
          if (shipOrientation === "vertical") {
            return board[rowIndex + index][colIndex].ship.hasShip;
          } else {
            return board[rowIndex][colIndex + index].ship.hasShip;
          }
        });

      if (!shipHasConflict) {
        handleShipPlacement();
      }
    } catch (error) {
      console.log("You can't place a ship");
    }
  };

  return (
    <div
      className={`w-10 h-10 border border-gray-500 ${color} `}
      onClick={handleCellClick}
      onMouseEnter={() => {
        onHover(rowIndex, colIndex);
      }}
    ></div>
  );
};

export default GridCell;
