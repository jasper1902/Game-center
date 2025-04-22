import React from "react";
import TicTacToe from "./game";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "❌⭕ Tic Tac Toe",
  description:
    "A timeless game of strategy and wit! Take turns placing Xs and Os on the grid—get three in a row to win. Quick, fun, and deceptively tricky. Perfect for casual play with friends or sharpening your logic skills!",
};

const page = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <TicTacToe />
    </main>
  );
};

export default page;
