import React, { ChangeEvent, Fragment, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HtmlTooltip } from "@/components/HtmlTooltip"; // Assuming you still use this
import { useSocketStore } from "@/store/socket";
import { generateRoomId } from "@/utils/generateRoomId";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Game } from "@/types/room";

type Props = {
  game: Game;
  maxPlayers: number;
};

export default function Lobby({ game, maxPlayers }: Props) {
  const {
    setLobbyList,
    fetchLobbyData,
    setCurrentPage,
    setRowsPerPage,
    currentPage,
    rowsPerPage,
    lobbyList,
    setRoomId,
    socket,
    username,
    setUsername,
    roomId,
    setJoinRoomState,
  } = useSocketStore();

  useEffect(() => {
    socket?.on("update-lobby-list", (lobby) => {
      setLobbyList(lobby);
    });
    return () => {
      socket?.off("update-lobby-list");
    };
  }, [setLobbyList, socket]);

  useEffect(() => {
    fetchLobbyData();
  }, [fetchLobbyData]);

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (value: string) => {
    setRowsPerPage(parseInt(value));
    setCurrentPage(0);
  };

  const joinRoom = (id: string, gameType: Game) => {
    const usernamePattern: RegExp =
      /^(?=.*[a-zA-Zก-ฮ0-1])[a-zA-Zก-ฮ0-1!@#$%^&*()-=_+{}\[\]:;"'<>,.?/|\\]{3,32}$/;
    const roomIdPattern: RegExp = /^[a-zA-Z0-9]+$/;

    if (!usernamePattern.test(username)) {
      alert("ชื่อผู้ใช้ไม่ถูกต้อง");
      return;
    }

    if (!roomIdPattern.test(id ?? roomId)) {
      alert("รหัสห้องไม่ถูกต้อง");
      return;
    }
    socket?.emit("join-room", id ?? roomId, username, gameType);
    setJoinRoomState(true);
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLobbyList = lobbyList.slice(startIndex, endIndex);

  const totalPages = Math.ceil(lobbyList.length / rowsPerPage);

  return (
    <div className="space-y-6">
      <h1 className="text-center text-6xl tracking-[0.5em] text-transparent font-bold pb-5 bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">
        {game}
      </h1>

      <Input
        placeholder="Name"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
        className="w-full max-w-md mx-auto"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Id</TableHead>
              <TableHead className="text-right">User</TableHead>
              <TableHead className="text-right">Host</TableHead>
              <TableHead className="text-right">
                <Button
                  onClick={() => {
                    const id = generateRoomId();
                    setRoomId(id);
                    joinRoom(id, game);
                  }}
                >
                  Create Room
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedLobbyList
              .filter((lobby) => lobby.game === game)
              .map((row) => (
                <TableRow key={row.roomId} className="cursor-pointer">
                  <TableCell>{row.roomId}</TableCell>
                  <TableCell className="text-right">
                    <HtmlTooltip
                      title={
                        <Fragment>
                          {row.user.map((i, index) => (
                            <p key={i.id}>
                              {index + 1}. {i.username}
                            </p>
                          ))}
                        </Fragment>
                      }
                    >
                      <span>{`${row.user.length}`}</span>
                    </HtmlTooltip>
                  </TableCell>
                  <TableCell className="text-right">{row.host}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      disabled={row.user.length >= maxPlayers}
                      onClick={() => {
                        setRoomId(row.roomId);
                        joinRoom(row.roomId, game);
                      }}
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Select
          value={String(rowsPerPage)}
          onValueChange={handleChangeRowsPerPage}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 25].map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handleChangePage(Math.max(currentPage - 1, 0))}
              />
            </PaginationItem>
            <PaginationItem className="px-4">
              Page {currentPage + 1} of {totalPages}
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handleChangePage(Math.min(currentPage + 1, totalPages - 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
