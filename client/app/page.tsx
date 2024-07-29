import GameLink from "@/components/GameLink";
import pongLogo from "@/public/pong.png";
import drawLogo from "@/public/Drawing.png";
import battleshipLogo from "@/public/Battleship_naval_game_logo.png";

export default function Home() {
  return (
    <>
      <div className="flex justify-center min-h-screen items-center gap-4">
        <GameLink href="/pong" src={pongLogo} alt="Pong" />
        <GameLink href="/draw" src={drawLogo} alt="Drawing" />
        <GameLink href="/battleship" src={battleshipLogo} alt="Battleship" />
      </div>
    </>
  );
}
