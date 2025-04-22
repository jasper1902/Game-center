import React from "react";
import Game from "./Game";
import "./style.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🟡🔴 Connect Four",
  description:
    "Drop your discs and aim for four in a row—vertically, horizontally, or diagonally! Outsmart your opponent in this classic game of tactics and timing. Simple to learn, endlessly competitive!",
};
const page = () => {
  return (
    <>
      <Game />
    </>
  );
};

export default page;
