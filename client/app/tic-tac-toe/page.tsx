import React from "react";
import TicTacToe from "./game";

type Props = {};

const page = (props: Props) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      <TicTacToe />
    </main>
  );
};

export default page;
