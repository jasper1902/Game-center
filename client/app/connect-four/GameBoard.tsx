import React, { useEffect } from "react";
import GamePiece from "./GamePiece";
import { Board, useGameStore } from "../../store/game/connect-four";
import { motion } from "framer-motion";
import { useSocketStore } from "@/store/socket";
import { ConnectedUsers } from "@/types/user";

const GameBoard = () => {
  const {
    board,
    currentPlayer,
    dropPiece,
    gameStatus,
    winningCells,
    setPlayer,
    player,
    setGameStatus,
    resetGame,
    setBoard,
  } = useGameStore();
  const { socket, roomId, setUserList, username, handleKick } =
    useSocketStore();

  useEffect(() => {
    const handleUpdateUserList = (userList: ConnectedUsers[]) => {
      setPlayer(userList[0].username === username ? "red" : "yellow");
      if (userList.length === 2) setGameStatus("playing");
      setUserList(userList);

      socket?.emit("connect-four-board", { roomId, board });
    };

    const handleReset = () => resetGame();
    const handleDropPiece = (col: number) => dropPiece(col);
    const handleUpdateBoard = (board: Board) => setBoard(board);

    socket?.on("update-user-list", handleUpdateUserList);
    socket?.on("kick", handleKick);
    socket?.on("connect-four-board", handleUpdateBoard);
    socket?.on("connect-four-reset", handleReset);
    socket?.on("connect-four-drop-piece", handleDropPiece);

    return () => {
      socket?.off("connect-four-drop-piece", handleDropPiece);
      socket?.off("update-user-list", handleUpdateUserList);
      socket?.off("kick", handleKick);
      socket?.off("connect-four-reset", handleReset);
      socket?.off("connect-four-board", handleUpdateBoard);
    };
  }, [
    board,
    dropPiece,
    handleKick,
    resetGame,
    roomId,
    setBoard,
    setGameStatus,
    setPlayer,
    setUserList,
    socket,
    username,
  ]);

  const isWinningCell = (row: number, col: number): boolean => {
    return winningCells.some((cell) => cell[0] === row && cell[1] === col);
  };

  const handleColumnClick = (col: number) => {
    if (gameStatus === "playing" && player === currentPlayer) {
      socket?.emit("connect-four-drop-piece", {
        roomId,
        col,
      });
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        {/* Column hover indicators */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {Array(7)
            .fill(null)
            .map((_, colIndex) => (
              <div
                key={`indicator-${colIndex}`}
                className="h-8 flex justify-center items-center"
              >
                {gameStatus === "playing" && (
                  <motion.div
                    className={`w-10 h-10 rounded-full ${
                      currentPlayer === "red"
                        ? "bg-connect4-red"
                        : "bg-connect4-yellow"
                    } opacity-60`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    layoutId="hoverIndicator"
                  />
                )}
              </div>
            ))}
        </div>

        {/* Game board */}
        <div
          className="bg-connect4-board rounded-lg p-4 shadow-xl"
          style={{ borderRadius: "15px" }}
        >
          <div className="grid grid-cols-7 gap-1">
            {board.map((row, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                {row.map((cell, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="aspect-square p-1 relative"
                    onClick={() => handleColumnClick(colIndex)}
                  >
                    {/* Cell background with hole effect */}
                    <div className="w-full h-full bg-connect4-board relative">
                      <div className="absolute inset-0 connect4-hole bg-background"></div>
                    </div>

                    {/* Game piece */}
                    {cell && (
                      <div className="absolute inset-0 p-1">
                        <GamePiece
                          color={cell}
                          row={rowIndex}
                          isWinningPiece={isWinningCell(rowIndex, colIndex)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GameBoard;
