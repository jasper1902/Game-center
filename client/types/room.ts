export type Lobby = {
  game: "DRAW" | "PONG" | "BATTLESHIP" | "TIC TAC TOE"
  roomId: string;
  host: string;
  user: { id: string; username: string; host: boolean }[];
};
