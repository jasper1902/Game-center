"use client";
import { useEffect } from "react";
import { useSocketStore } from "@/store/socket";
import Lobby from "@/components/Lobby";
import { ConnectedUsers } from "@/types/user";
import Swal from "sweetalert2";
import {
  CellValue,
  GameResult,
  useticTacToeStore,
} from "@/store/game/tic-tac-toe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, X, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function TicTacToe() {
  const { socket, roomId, username, setUserList, joinRoomState, userList } =
    useSocketStore();
  const {
    playerSymbol,
    board,
    currentPlayer,
    gameStatus,
    winner,
    setPlayerSymbol,
    setGameStatus,
    setBoard,
    setCurrentPlayer,
    setWinner,
    setWinningLine,
    winningLine,
    gameHistory,
    setGameHistory,
  } = useticTacToeStore();

  useEffect(() => {
    const handleUpdateUserList = (userList: ConnectedUsers[]) =>
      setUserList(userList);
    const handleSetplayerSymbol = (symbol: "X" | "O") =>
      setPlayerSymbol(symbol);
    const handleGameStart = (initialBoard: CellValue[]) => {
      setBoard(initialBoard);
      setGameStatus("playing");
    };

    const handleMakeMove = ({
      board,
      currentPlayer,
    }: {
      board: CellValue[];
      currentPlayer: "X" | "O";
    }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
    };

    const handleGameOver = ({
      winner,
      board,
    }: {
      winner: GameResult;
      board: CellValue[];
    }) => {
      setBoard(board);
      setGameStatus("finished");
      setWinner(winner);
    };

    const handleGameReset = () => {
      setCurrentPlayer("X");
      setWinner(null);
      setWinningLine(null);
    };

    socket?.on("update-user-list", handleUpdateUserList);
    socket?.on("kick", handleKick);
    socket?.on("TicTacToe-assignSymbol", handleSetplayerSymbol);
    socket?.on("TicTacToe-gameStart", handleGameStart);
    socket?.on("TicTacToe-moveMade", handleMakeMove);
    socket?.on("TicTacToe-gameOver", handleGameOver);
    socket?.on("TicTacToe-gameReset", handleGameReset);

    return () => {
      socket?.off("TicTacToe-assignSymbol", handleSetplayerSymbol);
      socket?.off("TicTacToe-gameStart", handleGameStart);
      socket?.off("TicTacToe-moveMade", handleMakeMove);
      socket?.off("TicTacToe-gameOver", handleGameOver);
      socket?.off("TicTacToe-gameReset", handleGameReset);
      socket?.off("update-user-list", handleUpdateUserList);
      socket?.off("kick", handleKick);
    };
  }, [
    setBoard,
    setCurrentPlayer,
    setGameStatus,
    setPlayerSymbol,
    setUserList,
    setWinner,
    setWinningLine,
    socket,
  ]);

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);

      if (result.winner === "X") {
        setGameHistory((prev) => ({ ...prev, x: prev.x + 1 }));
      } else if (result.winner === "O") {
        setGameHistory((prev) => ({ ...prev, o: prev.o + 1 }));
      }
    } else if (!board.includes(null)) {
      setWinner("draw");
    }
  }, [board, setGameHistory, setWinner, setWinningLine]);

  const handleKick = async (message: string) => {
    await Swal.fire({
      title: message,
      confirmButtonText: "Ok",
    });
    location.reload();
  };

  const handleMakeMove = (cellIndex: number) => {
    if (
      socket &&
      gameStatus === "playing" &&
      playerSymbol === currentPlayer &&
      !board[cellIndex]
    ) {
      socket.emit("TicTacToe-makeMove", {
        roomId,
        cellIndex,
        symbol: playerSymbol,
      });
    }
  };

  function calculateWinner(
    board: Array<string | null>
  ): { winner: GameResult; line: number[] } | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] as GameResult, line: lines[i] };
      }
    }

    return null;
  }

  const resetGame = () => {
    if (socket && roomId) {
      socket?.emit("TicTacToe-gameReset", roomId);
      socket?.emit("TicTacToe-gameStart", Array(9).fill(null));
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setGameStatus("playing");
      setWinner(null);
      setWinningLine(null);
    }
  };

  const boardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const squareVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <>
      {!joinRoomState ? (
        <>
          <div className="flex flex-col gap-10 pr-10">
            <Lobby game="TIC TAC TOE" maxPlayers={2} />
          </div>
        </>
      ) : (
        <>
          <div className="flex">
            <Card className="w-full max-w-md shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Room: {roomId}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Users className="w-4 h-4" />
                      {userList.length}{" "}
                      {userList.length === 1 ? "participant" : "participants"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 border-2">
                    {true ? "Host" : "Member"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    You are signed in as
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${username}.png`}
                        alt={username}
                      />
                      <AvatarFallback>
                        {username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{username}</p>
                      {true && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Room Host
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Participants
                  </h3>
                  <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-2">
                      {userList.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/10">
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${user.username}.png`}
                                alt={user.username}
                              />
                              <AvatarFallback>
                                {user.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {user.username}
                              </span>
                              {user.host && (
                                <Shield className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          </div>

                          {true && user.username !== username && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                socket?.emit(
                                  "kick-user",
                                  roomId,
                                  user.id,
                                  username
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">
                                Kick {user.username}
                              </span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full max-w-md shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-rose-500" />
                  Tic Tac Toe
                  <Sparkles className="h-6 w-6 text-teal-500" />
                </CardTitle>
                <div className="flex justify-center gap-6 text-sm mt-2">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-rose-500 text-xl">X</span>
                    <span className="font-medium">{gameHistory.x}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-teal-500 text-xl">O</span>
                    <span className="font-medium">{gameHistory.o}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <motion.div
                  variants={boardVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-3 max-w-xs mx-auto"
                >
                  {board.map((square, i) => (
                    <motion.div
                      key={i}
                      variants={squareVariants}
                      whileHover={!square && !winner ? { scale: 1.05 } : {}}
                      whileTap={!square && !winner ? { scale: 0.95 } : {}}
                      className={`aspect-square flex items-center justify-center rounded-xl text-4xl font-bold cursor-pointer shadow-sm
                ${
                  !square && !winner
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                    : ""
                }
                ${
                  winningLine?.includes(i)
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-white dark:bg-gray-900"
                }
                ${square ? "cursor-default" : "hover:shadow-md"}
                border-2 border-gray-100 dark:border-gray-800
              `}
                      onClick={() => handleMakeMove(i)}
                    >
                      {square && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={
                            square === "X" ? "text-rose-500" : "text-teal-500"
                          }
                        >
                          {square}
                        </motion.span>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetGame}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  New Game
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
