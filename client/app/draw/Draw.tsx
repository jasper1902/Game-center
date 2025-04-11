"use client";
import { useDraw } from "@/hooks/useDraw";
import { drawLine } from "@/utils/drawLine";
import { Button, Input, Slider } from "@mui/material";
import { useEffect, useRef, MouseEvent } from "react";
import { ChromePicker, ColorResult } from "react-color";

import {
  CursorProps,
  DrawLineProps,
  type Draw as DrawType,
} from "@/types/draw";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useDrawStore } from "@/store/game/draw";
import { ConnectedUsers } from "@/types/user";
import { useSocketStore } from "@/store/socket";
import Lobby from "@/components/Lobby";

const Draw = () => {
  const router = useRouter();
  const { color, setColor, cursors, setCursors, lineWidth, setLineWidth } =
    useDrawStore();

  const {
    username,
    setUsername,
    roomId,
    joinRoomState,
    setJoinRoomState,
    userList,
    setUserList,
    socket,
  } = useSocketStore();

  const { canvasRef, onMouseDown, clear } = useDraw(createLine);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket?.on("get-canvas-state", () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket?.emit("canvas-state", canvasRef.current.toDataURL(), roomId);
    });

    socket?.on("canvas-state-from-server", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket?.on(
      "draw-line",
      ({ prevPoint, currentPoint, color, lineWidth }: DrawLineProps) => {
        if (!ctx) return
        drawLine({ prevPoint, currentPoint, ctx, color, lineWidth });
      }
    );

    socket?.on(
      "draw-cursor",
      ({ x, y, color, username, lineWidth }: CursorProps) => {
        setCursors((prevCursors: CursorProps[]) => {
          let cursorFound = false;

          const newCursors = prevCursors.map((cursor) => {
            if (cursor.username === username) {
              cursorFound = true;
              return { x, y, color, username, lineWidth };
            }
            return cursor;
          });

          if (!cursorFound) {
            return [...newCursors, { x, y, color, username, lineWidth }];
          }

          return newCursors;
        });
      }
    );

    socket?.on("update-user-list", (userList: ConnectedUsers[]) => {
      setUserList(userList);
      const cursorCtx = cursorCanvasRef.current?.getContext("2d");
      if (!cursorCtx || !cursorCanvasRef.current) return;

      cursorCtx.clearRect(
        0,
        0,
        cursorCanvasRef.current.width,
        cursorCanvasRef.current.height
      );

      const userListSet = new Set(
        userList.map((i: ConnectedUsers) => i.username)
      );
      const newCursors = cursors.filter((cursor: CursorProps) =>
        userListSet.has(cursor.username)
      );
      setCursors(newCursors);
    });

    socket?.on("clear", clear);

    socket?.on("kick", async (message: string) => {
      await Swal.fire({
        title: message,
        confirmButtonText: "Ok",
      });

      location.reload();
    });

    return () => {
      socket?.off("draw-line");
      socket?.off("get-canvas-state");
      socket?.off("canvas-state-from-server");
      socket?.off("draw-cursor");
      socket?.off("clear");
      socket?.off("update-user-list");
      socket?.off("kick");
    };
  }, [
    canvasRef,
    clear,
    cursors,
    lineWidth,
    roomId,
    router,
    setCursors,
    setUserList,
    socket,
  ]);

  function createLine({ prevPoint, currentPoint, ctx }: DrawType) {
    socket?.emit("draw-line", {
      prevPoint,
      currentPoint,
      color,
      roomId,
      lineWidth,
    });
    drawLine({ prevPoint, currentPoint, ctx, color, lineWidth });
  }

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      socket?.emit("draw-cursor", { x, y, color, username, roomId, lineWidth });
      renderCursors();
    }
  };

  const renderCursors = () => {
    const cursorCtx = cursorCanvasRef.current?.getContext("2d");
    if (!cursorCtx || !cursorCanvasRef.current) return;

    cursorCtx.clearRect(
      0,
      0,
      cursorCanvasRef.current.width,
      cursorCanvasRef.current.height
    ); // Clear the entire overlay canvas

    Object.values(cursors).forEach(({ x, y, color, username, lineWidth }) => {
      cursorCtx.fillStyle = color;
      cursorCtx.beginPath();
      cursorCtx.arc(x, y, lineWidth, 0, 2 * Math.PI);
      cursorCtx.fill();
      cursorCtx.fillStyle = "black";
      cursorCtx.fillText(username, x + lineWidth, y + lineWidth);
    });
  };

  useEffect(() => {
    renderCursors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursors]);

  const joinRoom = (id: string) => {
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
    socket?.emit("join-room", id ?? roomId, username, "DRAW");
    setJoinRoomState(true);
  };

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center">
      {!joinRoomState ? (
        <>
          <div className="flex flex-col gap-10 pr-10">
            <Lobby joinRoom={joinRoom} game="DRAW" maxPlayers={999} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 pr-10">
            <h2>Username: {username}</h2>
            <h2>Room Id: {roomId}</h2>
            <Slider
              defaultValue={lineWidth}
              value={lineWidth}
              onChange={(event, newValue) => {
                if (typeof newValue === "number") {
                  setLineWidth(newValue);
                }
              }}
              aria-label="line width"
              valueLabelDisplay="on"
              min={1}
              max={50}
            />

            <ChromePicker
              color={color}
              onChange={(e: ColorResult) => setColor(e.hex)}
            />
            <Button
              variant="outlined"
              onClick={() => socket?.emit("clear", roomId)}
            >
              Clear canvas
            </Button>
            <div>
              <h3>User list</h3>
              {userList.map((user: ConnectedUsers, index: number) => (
                <p key={user.id}>
                  {index + 1}. {user.username}{" "}
                  {userList.filter((user) => user.host)[0]?.username ===
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
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              onMouseDown={onMouseDown}
              onMouseMove={handleMouseMove}
              width={750}
              height={750}
              className="border border-black rounded-md"
            />
            <canvas
              ref={cursorCanvasRef}
              width={750}
              height={750}
              className="border border-black rounded-md"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Draw;
