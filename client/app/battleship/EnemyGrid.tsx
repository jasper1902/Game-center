import React, { useEffect, useCallback, useMemo } from "react";
import { Cell, useBattleshipStore } from "@/store/game/battleship";
import { useSocketStore } from "@/store/socket";

// Props for GridCell component
interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  cell: Cell;
}

// Component for rendering enemy's grid
const EnemyGridCell: React.FC<GridCellProps> = ({
  rowIndex,
  colIndex,
  cell,
}) => {
  const {
    gameState,
    setBoard,
    board,
    isPlayerTurn,
    setPlayerTurn,
    getShipColorClassName,
  } = useBattleshipStore();
  const { socket, username, roomId } = useSocketStore();
  const handleAttacked = useCallback(
    ({
      colIndex,
      rowIndex,
      username,
      enemyUsername,
    }: {
      colIndex: number;
      rowIndex: number;
      username: string;
      enemyUsername: string;
    }) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[rowIndex][colIndex] = {
          ...newBoard[rowIndex][colIndex],
          attack: { ...newBoard[rowIndex][colIndex].attack, received: true },
        };
        return newBoard;
      });

      if (enemyUsername !== username) {
        setPlayerTurn(true);
      }

      const isHit = board[rowIndex][colIndex].ship.hasShip;
      if (isHit) {
        const shipName = board[rowIndex][colIndex].ship.name;
        socket?.emit("battleship-hit", roomId, { colIndex, rowIndex, isHit, shipName });
      }
    },
    [board, roomId, setBoard, socket, setPlayerTurn]
  );

  const handleHit = useCallback(
    ({
      colIndex,
      rowIndex,
      isHit,
      shipName,
    }: {
      colIndex: number;
      rowIndex: number;
      isHit: boolean;
      shipName: string;
    }) => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[rowIndex][colIndex] = {
          ...newBoard[rowIndex][colIndex],
          attack: {
            ...newBoard[rowIndex][colIndex].attack,
            destroyed: { hit: true, name: shipName },
          },
        };
        return newBoard;
      });
    },
    [setBoard]
  );

  useEffect(() => {
    socket?.on("battleship-attacked", handleAttacked);
    socket?.on("battleship-hit", handleHit);
    return () => {
      socket?.off("battleship-attacked", handleAttacked);
      socket?.off("battleship-hit", handleHit);
    };
  }, [socket, handleAttacked, handleHit]);

  const handleCellClick = useCallback(() => {
    if (
      gameState === "STARTED" &&
      !board[rowIndex][colIndex].attack.hit &&
      isPlayerTurn
    ) {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[rowIndex][colIndex] = {
          ...newBoard[rowIndex][colIndex],
          attack: { ...newBoard[rowIndex][colIndex].attack, hit: true },
        };
        return newBoard;
      });
      socket?.emit("battleship-attack", roomId, { colIndex, rowIndex, username });
      setPlayerTurn(false);
    }
  }, [
    gameState,
    board,
    rowIndex,
    colIndex,
    isPlayerTurn,
    setBoard,
    socket,
    roomId,
    username,
    setPlayerTurn,
  ]);

  const useCellClassName = (
    gameState: string,
    isPlayerTurn: boolean,
    cell: {
      ship?: { hasShip: boolean; name?: string };
      attack: {
        received: boolean;
        hit: boolean;
        destroyed: { hit: boolean; name: string | null };
      };
      x?: number;
      y?: number;
    },
    getShipColorClassName: { (shipName: string): string; (arg0: any): any }
  ) => {
    const baseClasses = "w-10 h-10 border border-gray-500";

    const getHoverClass = () => {
      if (gameState === "STARTED" && isPlayerTurn) {
        return "hover:bg-blue-400";
      }
      return "";
    };

    const getAttackClass = () => {
      if (cell.attack.hit) {
        if (cell.attack.destroyed.name) {
          return getShipColorClassName(cell.attack.destroyed.name);
        }
        return "bg-red-700";
      }
      return "bg-gray-400";
    };

    const getCursorClass = () => {
      return isPlayerTurn ? "cursor-pointer" : "cursor-wait";
    };

    return `${baseClasses} ${getHoverClass()} ${getAttackClass()} ${getCursorClass()}`;
  };

  const cellClassName = useMemo(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCellClassName(
      gameState,
      isPlayerTurn,
      cell,
      getShipColorClassName
    );
  }, [gameState, isPlayerTurn, cell, getShipColorClassName]);

  return <div className={cellClassName} onClick={handleCellClick}></div>;
};

export default EnemyGridCell;
