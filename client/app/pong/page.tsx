import React from "react";
import PongGame from "./PongGame";
import Head from "next/head";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🏓 Pong Game",
  description:
    "Relive the retro arcade vibes with this classic table tennis-inspired game! Control your paddle, deflect the ball, and outscore your opponent in this fast-paced 2D duel. Perfect for a quick challenge or endless fun with a friend. Simple to play, hard to master!",
};

const page = () => {
  return (
    <>
      <Head>
        <title>Pong</title>
      </Head>
      <PongGame />
    </>
  );
};

export default page;
