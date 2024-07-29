import { Request, Response } from "express";
import { lobby } from "../sockets/socketHandler";

export const getLobby = (req: Request, res: Response) => {
  res.json(lobby);
};

export const getRoomLobby = (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  res.json(lobby.filter((i) => i.roomId === roomId));
};
