"use client";
import React from "react";
import GameBoard from "./GameBoard";
import GameControls from "./GameControls";
import { motion } from "framer-motion";
import { useSocketStore } from "@/store/socket";
import Lobby from "@/components/Lobby";

const Game = () => {
  const { joinRoomState } = useSocketStore();

  return (
    <>
      {!joinRoomState ? (
        <div className="w-screen h-screen bg-white flex justify-center items-center">
          {" "}
          <div className="flex flex-col gap-10 pr-10">
            <Lobby game="CONNECT 4" maxPlayers={2} />
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-screen flex flex-col items-center justify-center bg-background py-10 px-4">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-connect4-blue to-connect4-highlight bg-clip-text text-transparent mb-2">
                Connect Four
              </h1>
              <p className="text-muted-foreground">
                Connect four of your pieces to win!
              </p>
            </motion.div>

            <motion.div
              className="w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GameBoard />
              <GameControls />
            </motion.div>

            <motion.div
              className="mt-10 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <p>Click on any column to drop your piece.</p>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
};

export default Game;
