import React, { ChangeEvent, Fragment, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, Input, TablePagination } from "@mui/material";
import { generateRoomId } from "@/utils/generateRoomId";
import { HtmlTooltip } from "@/components/HtmlTooltip";
import { useSocketStore } from "@/store/socket";

type Props = {
  joinRoom: (id: string) => void;
  game: string;
  maxPlayers: number;
};

export default function Lobby({ joinRoom, game, maxPlayers }: Props) {
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLobbyList = lobbyList.slice(startIndex, endIndex);

  return (
    <>
      <h1 className="text-center text-6xl tracking-[0.5em] text-transparent font-bold pb-5 bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400 ">
        {game}
      </h1>
      <Input
        placeholder="Name"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650, cursor: "pointer" }}
          aria-label="simple table"
          role="checkbox"
          tabIndex={-1}
        >
          <TableHead>
            <TableRow>
              <TableCell>Room Id</TableCell>
              <TableCell align="right">User</TableCell>
              <TableCell align="right">Host</TableCell>
              <TableCell align="right">
                <Button
                  variant="contained"
                  onClick={() => {
                    const id = generateRoomId();
                    setRoomId(id);
                    joinRoom(id);
                  }}
                >
                  Create Room
                </Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLobbyList
              .filter((lobby) => lobby.game === game)
              .map((row) => (
                <TableRow key={row.roomId} sx={{ "&td, &th": { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.roomId}
                  </TableCell>
                  <TableCell align="right">
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
                  <TableCell align="right">{row.host}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      disabled={row.user.length >= maxPlayers}
                      onClick={() => {
                        setRoomId(row.roomId), joinRoom(row.roomId);
                      }}
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={lobbyList.length}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}
