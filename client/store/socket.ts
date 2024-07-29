import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { ConnectedUsers } from "@/types/user";
import { Lobby } from "@/types/room";
import axios from "axios";

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SERVER;

const initializeSocket = (): Socket | null => {
  if (!SOCKET_SERVER_URL) {
    console.error("NEXT_PUBLIC_SERVER environment variable is not defined");
    return null;
  }
  const socket = io(SOCKET_SERVER_URL);
  const disconnectSocket = () => {
    socket?.disconnect();
  };
  return socket;
};

type Store = {
  socket: Socket | null;
  username: string;
  setUsername: (username: string) => void;
  roomId: string;
  setRoomId: (roomId: string) => void;
  joinRoomState: boolean;
  setJoinRoomState: (joinRoomState: boolean) => void;
  userList: ConnectedUsers[];
  setUserList: (
    userList:
      | ConnectedUsers[]
      | ((prevUserList: ConnectedUsers[]) => ConnectedUsers[])
  ) => void;
  lobbyList: Lobby[];
  setLobbyList: (lobbyList: Lobby[]) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  fetchLobbyData: () => void;
  disconnectSocket: () => void;
};

export const useSocketStore = create<Store>()((set, get) => ({
  socket: initializeSocket(),
  username: "",
  setUsername: (username: string) => set({ username }),
  roomId: "",
  setRoomId: (roomId: string) => set({ roomId }),
  joinRoomState: false,
  setJoinRoomState: (joinRoomState: boolean) => set({ joinRoomState }),
  userList: [],
  setUserList: (userList) =>
    set((state) => ({
      userList:
        typeof userList === "function" ? userList(state.userList) : userList,
    })),
  lobbyList: [],
  setLobbyList: (lobbyList: Lobby[]) => set({ lobbyList }),
  rowsPerPage: 5,
  setRowsPerPage: (rowsPerPage: number) => set({ rowsPerPage }),
  currentPage: 0,
  setCurrentPage: (page: number) => set({ currentPage: page }),
  fetchLobbyData: async () => {
    try {
      const response = await axios.get(`${SOCKET_SERVER_URL}/lobby`);
      set({ lobbyList: response.data });
    } catch (error) {
      console.error("Error fetching lobby data", error);
    }
  },
  disconnectSocket: () => {
    const socket = get().socket;
    socket?.disconnect();
  },
}));
