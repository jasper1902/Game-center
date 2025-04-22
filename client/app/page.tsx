import { Card } from "@/components/ui/card";
import { GamepadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-center min-h-screen items-center ">
        <GameGrid />
      </div>
    </>
  );
}

interface GameCardProps {
  title: string;
  href: string;
}

const GameCard = ({ title, href }: GameCardProps) => {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "group relative overflow-hidden p-6 transition-all hover:scale-105",
          "cursor-pointer bg-white hover:shadow-xl",
          "flex flex-col items-center justify-center gap-4"
        )}
      >
        <div className="rounded-full bg-purple-100 p-4 transition-colors group-hover:bg-purple-200">
          <GamepadIcon className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </Card>
    </Link>
  );
};

const games = [
  { title: "Tic Tac Toe", path: "/tic-tac-toe" },
  { title: "Battleship", path: "/battleship" },
  { title: "Image Draw", path: "/draw" },
  { title: "Pong", path: "/pong" },
  { title: "Connect Four", path: "/connect-four" },
];

const GameGrid = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.title} title={game.title} href={game.path} />
      ))}
    </div>
  );
};
