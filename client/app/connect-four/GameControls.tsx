"use client";
import React from "react";
import { useGameStore } from "../../store/game/connect-four";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useSocketStore } from "@/store/socket";

const GameControls = () => {
  const { currentPlayer, gameStatus } = useGameStore();
  const { socket, roomId } = useSocketStore();
  return (
    <div className="w-full max-w-md mx-auto mt-8 flex flex-col items-center">
      {gameStatus === "playing" ? (
        <div className="flex items-center gap-3 text-xl font-semibold mb-4">
          <span>Current Turn:</span>
          <motion.div
            className={`h-8 w-8 rounded-full ${
              currentPlayer === "red" ? "bg-connect4-red" : "bg-connect4-yellow"
            }`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="capitalize">{currentPlayer}</span>
        </div>
      ) : gameStatus === "won" ? (
        <motion.div
          className="flex items-center gap-2 text-xl font-bold mb-4 text-connect4-highlight"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Trophy className="h-6 w-6" />
          <span>
            Winner: <span className="capitalize">{currentPlayer}</span>
          </span>
        </motion.div>
      ) : (
        <motion.div
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Game ended in a draw!
        </motion.div>
      )}

      <Button
        onClick={() => {
          socket?.emit("connect-four-reset", {
            roomId,
          });
        }}
        variant="default"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        New Game
      </Button>
    </div>
  );
};

export default GameControls;
