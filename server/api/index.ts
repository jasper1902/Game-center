import express, { Request, Response } from "express";
import cors from "cors";
import { getLobby, getRoomLobby } from "./controllers/lobbyController";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.get("/lobby/:roomId", getRoomLobby);
app.get("/lobby", getLobby);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: `Hello world!` });
});

export default app;
