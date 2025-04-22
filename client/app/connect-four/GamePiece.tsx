"use client";
import React from 'react';
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';

interface GamePieceProps {
  color: 'red' | 'yellow' | null;
  row: number;
  isWinningPiece?: boolean;
  className?: string;
}

const GamePiece: React.FC<GamePieceProps> = ({ color, row, isWinningPiece = false, className }) => {
  if (!color) return null;

  return (
    <motion.div
      className={cn(
        "w-full h-full rounded-full shadow-inner",
        color === 'red' ? 'bg-connect4-red' : 'bg-connect4-yellow',
        isWinningPiece && 'ring-4 ring-connect4-highlight animate-pulse',
        className
      )}
      initial={{ y: -100 * (row + 1), opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.05 * row
      }}
    />
  );
};

export default GamePiece;
