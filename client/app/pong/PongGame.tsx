"use client";
import { usePongStore } from "@/store/game/pong";
import { useEffect, useRef } from "react";
import { Input, Button } from "@mui/material";
import { ConnectedUsers } from "@/types/user";
import Swal from "sweetalert2";
import { useSocketStore } from "@/store/socket";
import Lobby from "@/components/Lobby";

// Constants and interfaces
const paddleWidth = 18;
const paddleHeight = 150;
const ballRadius = 12;
const initialBallSpeed = 8;
const maxBallSpeed = 40;
const netWidth = 5;
const netColor = "WHITE";

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
}

interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  color: string;
  speed: number;
}

// Helper functions to create game objects
const createPaddle = (
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): Paddle => ({
  x,
  y,
  width,
  height,
  color,
  score: 0,
});

const createBall = (
  x: number,
  y: number,
  radius: number,
  velocityX: number,
  velocityY: number,
  color: string
): Ball => ({
  x,
  y,
  radius,
  velocityX,
  velocityY,
  color,
  speed: initialBallSpeed,
});

const PongGame = () => {
  const {
    socket,
    roomId,
    username,
    setUserList,
    setJoinRoomState,
    setUsername,
    joinRoomState,
    userList,
  } = useSocketStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    player: currentPlayer,
    setPlayer,
    gameStatus,
    setGameStatus,
  } = usePongStore();

  const ball = useRef<Ball | null>(null);
  const player1 = useRef<Paddle | null>(null);
  const player2 = useRef<Paddle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    // Initialize game objects
    player1.current = createPaddle(
      0,
      canvas.height / 2 - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
      "WHITE"
    );
    player2.current = createPaddle(
      canvas.width - paddleWidth,
      canvas.height / 2 - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
      "WHITE"
    );
    ball.current = createBall(
      canvas.width / 2,
      canvas.height / 2,
      ballRadius,
      initialBallSpeed,
      initialBallSpeed,
      "WHITE"
    );

    const drawRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      color: string
    ) => {
      if (!context) return;
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
    };

    const drawCircle = (
      x: number,
      y: number,
      radius: number,
      color: string
    ) => {
      if (!context) return;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2, false);
      context.closePath();
      context.fill();
    };

    const drawText = (
      text: string,
      x: number,
      y: number,
      color: string,
      fontSize = 60,
      fontWeight = "bold",
      font = "Courier New"
    ) => {
      if (!context) return;
      context.fillStyle = color;
      context.font = `${fontWeight} ${fontSize}px ${font}`;
      context.textAlign = "center";
      context.fillText(text, x, y);
    };

    const drawNet = () => {
      if (!canvas || !context) return;
      for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
      }
    };

    const movePaddle = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseY = event.clientY - rect.top - player1.current!.height / 2;
      const newY = Math.min(
        canvas.height - player1.current!.height,
        Math.max(0, mouseY)
      );

      if (currentPlayer === "PLAYER1") {
        if (player1.current) player1.current.y = newY;

        socket?.emit("pong-paddle", roomId, { player1Y: newY });
      } else if (currentPlayer === "PLAYER2") {
        if (player2.current) player2.current.y = newY;

        socket?.emit("pong-paddle", roomId, { player2Y: newY });
      }
    };

    canvas.addEventListener("mousemove", movePaddle);

    const collision = (b: Ball, p: Paddle) => {
      return (
        b.x + b.radius > p.x &&
        b.x - b.radius < p.x + p.width &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
      );
    };

    const resetBall = () => {
      if (!canvas || !ball.current) return;
      ball.current.x = canvas.width / 2;
      ball.current.y =
        Math.random() * (canvas.height - ball.current.radius * 2) +
        ball.current.radius;
      ball.current.velocityX = -ball.current.velocityX;
      ball.current.speed = initialBallSpeed;
    };

    const update = () => {
      if (
        !canvas ||
        !ball.current ||
        !player1.current ||
        !player2.current ||
        !socket
      )
        return;

      if (currentPlayer === "PLAYER1") {
        if (ball.current.x - ball.current.radius < 0) {
          player2.current.score++;
          socket?.emit("pong-score", roomId, {
            player1Score: player1.current.score,
            player2Score: player2.current.score,
          });
          resetBall();
        } else if (ball.current.x + ball.current.radius > canvas.width) {
          player1.current.score++;
          socket?.emit("pong-score", roomId, {
            player1Score: player1.current.score,
            player2Score: player2.current.score,
          });
          resetBall();
        }
      } else if (currentPlayer === "PLAYER2") {
        socket?.on("pong-score", ({ player1Score, player2Score }) => {
          if (player1.current && player2.current) {
            player1.current.score = player1Score;
            player2.current.score = player2Score;
          }
        });
      }

      if (currentPlayer === "PLAYER1") {
        ball.current.x += ball.current.velocityX;
        ball.current.y += ball.current.velocityY;
      }

      if (
        ball.current.y - ball.current.radius < 0 ||
        ball.current.y + ball.current.radius > canvas.height
      ) {
        ball.current.velocityY = -ball.current.velocityY;
      }

      let player =
        ball.current.x + ball.current.radius < canvas.width / 2
          ? player1.current
          : player2.current;
      if (collision(ball.current, player)) {
        const collidePoint = ball.current.y - (player.y + player.height / 2);
        const collisionAngle =
          (Math.PI / 4) * (collidePoint / (player.height / 2));
        const direction =
          ball.current.x + ball.current.radius < canvas.width / 2 ? 1 : -1;
        ball.current.velocityX =
          direction * ball.current.speed * Math.cos(collisionAngle);
        ball.current.velocityY = ball.current.speed * Math.sin(collisionAngle);

        ball.current.speed += 1.2;
        if (ball.current.speed > maxBallSpeed)
          ball.current.speed = maxBallSpeed;
      }

      socket?.emit("pong-ball", roomId, ball.current);
    };

    const render = () => {
      if (!canvas || !ball.current || !player1.current || !player2.current)
        return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawRect(0, 0, canvas.width, canvas.height, "BLACK");
      drawNet();

      drawText(
        player1.current.score.toString(),
        canvas.width / 4,
        canvas.height / 2,
        "GRAY",
        120,
        "bold"
      );
      drawText(
        player2.current.score.toString(),
        (3 * canvas.width) / 4,
        canvas.height / 2,
        "GRAY",
        120,
        "bold"
      );

      drawRect(
        player1.current.x,
        player1.current.y,
        player1.current.width,
        player1.current.height,
        player1.current.color
      );
      drawRect(
        player2.current.x,
        player2.current.y,
        player2.current.width,
        player2.current.height,
        player2.current.color
      );

      drawCircle(
        ball.current.x,
        ball.current.y,
        ball.current.radius,
        ball.current.color
      );
    };

    const gameLoop = () => {
      update();
      render();
    };

    const intervalId = setInterval(gameLoop, 1000 / 60);

    return () => {
      canvas.removeEventListener("mousemove", movePaddle);
      clearInterval(intervalId);
    };
  }, [currentPlayer, roomId, gameStatus, socket]);

  useEffect(() => {
    const handleUpdateUserList = (userList: ConnectedUsers[]) => {
      const isPlayer1 = userList[0]?.username === username;
      setPlayer(isPlayer1 ? "PLAYER1" : "PLAYER2");
      setUserList(userList);
    };

    socket?.on("pong-ball", (hostBall: Ball) => {
      if (currentPlayer === "PLAYER2" && ball.current) {
        ball.current.x = hostBall.x;
        ball.current.y = hostBall.y;
      }
    });

    socket?.on(
      "pong-paddle",
      ({ player1Y, player2Y }: { player1Y: number; player2Y: number }) => {
        if (currentPlayer === "PLAYER1" && player2.current) {
          player2.current.y = player2Y;
        } else if (currentPlayer === "PLAYER2" && player1.current) {
          player1.current.y = player1Y;
        }
      }
    );

    socket?.on("update-user-list", handleUpdateUserList);

    socket?.on("pong-game-status", (status: "PLAYING" | "WAIT") => {
      setGameStatus(status);
    });

    socket?.on("kick", async (message: string) => {
      await Swal.fire({
        title: message,
        confirmButtonText: "Ok",
      });

      location.reload();
    });

    return () => {
      socket?.off("update-user-list", handleUpdateUserList);
      socket?.off("pong-paddle");
      socket?.off("pong-ball");
      socket?.off("pong-game-status");
      socket?.off("kick");
    };
  }, [currentPlayer, setGameStatus, setPlayer, setUserList, socket, username]);

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center">
      {!joinRoomState ? (
        <>
          <div className="flex flex-col gap-10 pr-10">
            <Lobby game="PONG" maxPlayers={2} />
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
          <div>
            {gameStatus === "WAIT" ? (
              <>
                <Button
                  variant="contained"
                  disabled={currentPlayer === "PLAYER2"}
                  onClick={() => {
                    setGameStatus("PLAYING");
                    socket?.emit("pong-game-status", roomId, "PLAYING");
                  }}
                >
                  {currentPlayer === "PLAYER1" ? "PLAY" : "WITH FOR PLAYER 1"}
                </Button>
              </>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={800}
                  id="game"
                ></canvas>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PongGame;
