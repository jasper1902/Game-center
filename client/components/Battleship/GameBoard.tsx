import React, { useState, useCallback, useEffect, Fragment } from "react";
import { Button, SelectChangeEvent } from "@mui/material";
import SelectShip, { ShipType } from "@/components/Battleship/SelectShip";
import SelectOrientation from "@/components/Battleship/SelectVerticalOrHorizontal";
import ColumnHeaders from "@/components/Battleship/ColumnHeaders";
import GridCell from "@/components/Battleship/GridCell";
import { Cell, useBattleshipStore } from "@/store/game/battleship";
import EnemyGrid from "./EnemyGrid";
import Swal from "sweetalert2";
import { useSocketStore } from "@/store/socket";

const GameBoard: React.FC = () => {
  const {
    ships,
    selectedShip,
    setSelectedShip,
    shipOrientation,
    setShipOrientation,
    board,
    gameState,
    setGameState,
    highlightedCells,
    setHighlightedCells,
    otherPlayerState,
  } = useBattleshipStore();

  const { socket, roomId } = useSocketStore();

  // Optimized callback for ship selection change
  const handleShipSelectionChange = useCallback(
    (event: SelectChangeEvent) => {
      const selectedShipName = event.target.value;
      const matchingShip = ships.find(
        (ship) => ship.name === selectedShipName
      ) as ShipType;
      setSelectedShip(matchingShip);
    },
    [setSelectedShip, ships]
  );

  // Optimized callback for cell hover
  const handleCellHover = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!selectedShip) {
        return;
      }
      const newHighlightedCells = Array.from(
        { length: selectedShip.size },
        (_, i) =>
          shipOrientation === "vertical"
            ? { x: colIndex, y: rowIndex + i }
            : { x: colIndex + i, y: rowIndex }
      );
      setHighlightedCells(newHighlightedCells);
    },
    [selectedShip, setHighlightedCells, shipOrientation]
  );

  // Optimized callback for orientation change
  const handleOrientationChange = useCallback(
    (event: SelectChangeEvent) => {
      const selectedOrientation = event.target.value as
        | "vertical"
        | "horizontal";
      setShipOrientation(selectedOrientation);
    },
    [setShipOrientation]
  );

  // Effect to handle game state change
  useEffect(() => {
    const destroyedShips = board.flatMap((row) =>
      row.filter((cell) => cell.attack.destroyed.name)
    );

    const received = board.flatMap((row) =>
      row.filter((cell) => cell.attack.received && cell.ship.hasShip)
    );

    if (destroyedShips.length === 17) {
      setGameState("END");
      Swal.fire({
        position: "center",
        title: "You won!",
        showConfirmButton: false,
        timer: 4500,
      });
    }

    if (received.length === 17) {
      setGameState("END");
      Swal.fire({
        position: "center",
        title: "You lose!",
        showConfirmButton: false,
        timer: 4500,
      });
    }
  }, [board, roomId, setGameState, socket]);

  // Rendering the component
  return (
    <>
      <div className="flex">
        <div>
          <ColumnHeaders />
          <div className="grid grid-cols-11">
            {board.map((row, rowIndex) => (
              <Fragment key={`row-${rowIndex}`}>
                <div className="flex justify-center items-center w-10 h-10">
                  {rowIndex + 1}
                </div>
                {row.map((cell: Cell, colIndex: number) => {
                  const highlightedSet = new Set(
                    highlightedCells.map((h) => `${h.x}-${h.y}`)
                  );
                  const isCellHighlighted = highlightedSet.has(
                    `${colIndex}-${rowIndex}`
                  );
                  return (
                    <GridCell
                      key={`${rowIndex}-${colIndex}`}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      cell={cell}
                      isCellHighlighted={isCellHighlighted}
                      onHover={handleCellHover}
                      shipOrientation={shipOrientation}
                      // Simplified check for hasShip
                      hasShip={isCellHighlighted}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
        <div>
          <ColumnHeaders />
          <div className="grid grid-cols-11">
            {board.map((row, rowIndex) => (
              <Fragment key={`row-${rowIndex}`}>
                <div className="flex justify-center items-center w-10 h-10">
                  {rowIndex + 1}
                </div>
                {row.map((cell: Cell, colIndex: number) => (
                  <EnemyGrid
                    key={`${rowIndex}-${colIndex}`}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    cell={cell}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="flex mt-8 gap-4">
        {gameState === "PENDING" && (
          <>
            <SelectShip onSelectShip={handleShipSelectionChange} />
            <SelectOrientation
              orientation={shipOrientation}
              onOrientationChange={handleOrientationChange}
            />
          </>
        )}
        {gameState === "READY" && (
          <>
            <Button
              className="px-12"
              variant="outlined"
              onClick={() => {
                if (gameState === "READY") {
                  setGameState("WAIT");
                  if (otherPlayerState === "READY") {
                    socket?.emit("player-state", roomId, "STARTED");
                    setGameState("STARTED");
                  } else if (otherPlayerState === "PENDING") {
                    socket?.emit("player-state", roomId, "READY");
                  }
                }
              }}
            >
              Ready
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default GameBoard;
