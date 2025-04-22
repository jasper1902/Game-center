export type Game = "DRAW" | "PONG" | "BATTLESHIP" | "TIC TAC TOE" | "CONNECT 4" 
export type Lobby = {
  game: Game
  roomId: string;
  host: string;
  user: { id: string; username: string; host: boolean }[];
};
