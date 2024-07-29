export type Point = { x: number; y: number };

export type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  lineWidth: number;
};

export type Lobby = {
  game: "DRAW" | "PONG"
  roomId: string;
  host: string;
  user: { id: string; username: string; host: boolean }[];
}[];

export type ConnectedUsers = {
  [roomId: string]: { id: string; username: string; host?: boolean }[];
};
