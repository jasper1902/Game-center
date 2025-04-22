import React from "react";
import Battleship from "./Battleship";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🚢 Battleship",
  description:
    "Engage in naval warfare! Strategically place your fleet, then take turns firing shots to sink your opponent's ships. It's a thrilling game of deduction, memory, and surprise attacks. Sink 'em all before they sink you!",
};
const page = () => {
  return (
    <>
      <Battleship />
    </>
  );
};

export default page;
