export type Draw = {
  ctx: CanvasRenderingContext2D;
  currentPoint: Point;
  prevPoint: Point | null;
};

export type Point = { x: number; y: number };

export type CursorProps = {
  x: number;
  y: number;
  color: string;
  username: string;
  roomId?: string;
  lineWidth: number;
};


export type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  roomId: string;
  lineWidth: number;
};
