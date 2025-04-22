"use client";
import { useEffect } from "react";
import Head from "next/head";
import GameBoard from "@/app/battleship/GameBoard";
import { useBattleshipStore } from "@/store/game/battleship";
import { ConnectedUsers } from "@/types/user";
import { useSocketStore } from "@/store/socket";
import Lobby from "@/components/Lobby";
import { Button } from "@/components/ui/button";

const Battleship = () => {
  const { setPlayerTurn, setOtherPlayerState, setGameState, gameState } =
    useBattleshipStore();

  const {
    userList,
    joinRoomState,
    username,
    roomId,
    setUserList,
    socket,
    handleKick,
  } = useSocketStore();

  useEffect(() => {
    const handleUpdateUserList = (userList: ConnectedUsers[]) =>
      setUserList(userList);
    const handleUpdateState = (state: "END" | "READY" | "STARTED") => {
      setOtherPlayerState(state);
      if (state !== "READY") {
        setGameState(state);
      }
    };

    if (socket) {
      socket.on("update-user-list", handleUpdateUserList);
      socket.on("battleship-player-state", handleUpdateState);
      socket.on("kick", handleKick);

      return () => {
        socket.off("update-user-list", handleUpdateUserList);
        socket.off("kick", handleKick);
        socket.off("battleship-player-state", handleUpdateState);
      };
    }
  }, [
    gameState,
    handleKick,
    setGameState,
    setOtherPlayerState,
    setUserList,
    socket,
  ]);

  useEffect(() => {
    if (
      joinRoomState &&
      userList.some((user) => user.host && user.username === username)
    ) {
      setPlayerTurn(true);
    }
  }, [joinRoomState, setPlayerTurn, userList, username]);

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center">
      {!joinRoomState ? (
        <>
          <div className="flex flex-col gap-10 pr-10">
            <Lobby game="BATTLESHIP" maxPlayers={2} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 pr-10">
            <h2>Username: {username}</h2>
            <h2>Room Id: {roomId}</h2>
            <div>
              <h3>User list</h3>
              {userList.map((user: ConnectedUsers, index: number) => (
                <p key={user.id}>
                  {index + 1}. {user.username}{" "}
                  {userList.find((user) => user.host)?.username ===
                    username && (
                    <Button
                      onClick={() =>
                        socket?.emit("kick-user", roomId, user.id, username)
                      }
                    >
                      Kick
                    </Button>
                  )}
                </p>
              ))}
            </div>
          </div>
          <div className="container mx-auto p-4">
            <Head>
              <title>Battleship Game</title>
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-col items-center">
              <h1 className="text-2xl font-bold mb-4">Battleship Game</h1>
              <GameBoard />
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default Battleship;
