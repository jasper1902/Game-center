import { CursorProps } from "@/types/draw";
import { create } from "zustand";

type Store = {
  color: string;
  setColor: (color: string) => void;
  cursors: CursorProps[];
  setCursors: (
    cursors: CursorProps[] | ((prevCursors: CursorProps[]) => CursorProps[])
  ) => void;
  lineWidth: number;
  setLineWidth: (lineWidth: number) => void;
};

export const useDrawStore = create<Store>()((set) => ({
  color: "#000",
  setColor: (color: string) => set({ color }),
  cursors: [],
  setCursors: (cursors) =>
    set((state) => ({
      cursors: typeof cursors === "function" ? cursors(state.cursors) : cursors,
    })),
  lineWidth: 5,
  setLineWidth: (lineWidth: number) => set({ lineWidth }),
}));
