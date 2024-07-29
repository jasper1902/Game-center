export type Lobby = {
  game: "DRAW" | "PONG" | "BATTLESHIP"
  roomId: string;
  host: string;
  user: { id: string; username: string; host: boolean }[];
};
