"use client";

import { useState, useEffect, useCallback, useRef } from "react"; 
import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon, RefreshCcwIcon } from "lucide-react";

enum GameState {
  START,
  PAUSE,
  RUNNING,
  GAME_OVER,
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface Position {
  x: number;
  y: number;
}

const initialSnake: Position[] = [{ x: 0, y: 0 }];
const initialFood: Position = { x: 5, y: 5 };

export default function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [food, setFood] = useState<Position>(initialFood);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  const gameStartSound = useRef<HTMLAudioElement | null>(null);
  const eatSound = useRef<HTMLAudioElement | null>(null);
  const pauseSound = useRef<HTMLAudioElement | null>(null);
  const resetSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gameStartSound.current = new Audio("/sounds/start.mp3");
      eatSound.current = new Audio("/sounds/eat.mp3");
      pauseSound.current = new Audio("/sounds/pause.mp3");
      resetSound.current = new Audio("/sounds/reset.mp3");
    }
  }, []);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = newSnake[0];
      let newHead: Position;

      switch (direction) {
        case Direction.UP:
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case Direction.DOWN:
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case Direction.LEFT:
          newHead = { x: head.x - 1, y: head.y };
          break;
        case Direction.RIGHT:
          newHead = { x: head.x + 1, y: head.y };
          break;
        default:
          return newSnake;
      }

      if (newHead.x < 0 || newHead.y < 0 || newHead.x > 9 || newHead.y > 9) {
        setGameState(GameState.GAME_OVER);
        return newSnake;
      }

      if (newSnake.some((part) => part.x === newHead.x && part.y === newHead.y)) {
        setGameState(GameState.GAME_OVER);
        return newSnake;
      }

      newSnake.unshift(newHead);

      if (newHead.x === food.x && newHead.y === food.y) {
        eatSound.current?.play();
        setFood({
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10),
        });
        setScore((prevScore) => prevScore + 1);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) setDirection(Direction.UP);
          break;
        case "ArrowDown":
          if (direction !== Direction.UP) setDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
          break;
      }
    },
    [direction]
  );

  useEffect(() => {
    if (gameState === GameState.RUNNING) {
      gameInterval.current = setInterval(moveSnake, 200);
      document.addEventListener("keydown", handleKeyPress);
    } else {
      if (gameInterval.current) clearInterval(gameInterval.current);
      document.removeEventListener("keydown", handleKeyPress);
    }

    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, moveSnake, handleKeyPress]);

  const startGame = () => {
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
    setDirection(Direction.RIGHT);
    gameStartSound.current?.play();
    setGameState(GameState.RUNNING);
  };

  const pauseGame = () => {
    pauseSound.current?.play();
    setGameState(
      gameState === GameState.RUNNING ? GameState.PAUSE : GameState.RUNNING
    );
  };

  const resetGame = () => {
    resetSound.current?.play();
    setGameState(GameState.START);
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
  };

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0F0F0F] to-[#1E1E1E] relative">
      <div className="max-w-2xl p-8 rounded-lg shadow-2xl bg-gray-800 border border-gray-700 transition-all hover:border-blue-500 hover:shadow-blue-500/50">
        <div className="flex items-center justify-between mb-6">
          <div className="text-3xl font-bold text-[#FF00FF] animate-pulse">
            Snake Game
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#00FFFF] hover:bg-gradient-to-r hover:from-[#FF00FF] hover:to-[#00FFFF] transition-all duration-300"
              onClick={startGame}
            >
              <PlayIcon className="w-6 h-6" />
              <span className="sr-only">Start</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#00FFFF] hover:bg-gradient-to-r hover:from-[#FF00FF] hover:to-[#00FFFF] transition-all duration-300"
              onClick={pauseGame}
            >
              <PauseIcon className="w-6 h-6" />
              <span className="sr-only">Pause/Resume</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#00FFFF] hover:bg-gradient-to-r hover:from-[#FF00FF] hover:to-[#00FFFF] transition-all duration-300"
              onClick={resetGame}
            >
              <RefreshCcwIcon className="w-6 h-6" />
              <span className="sr-only">Reset</span>
            </Button>
          </div>
        </div>
        <div className="bg-[#0F0F0F] rounded-lg p-4 grid grid-cols-10 gap-1">
          {Array.from({ length: 100 }).map((_, i) => {
            const x = i % 10;
            const y = Math.floor(i / 10);
            const isSnakePart = snake.some(
              (part) => part.x === x && part.y === y
            );
            const isFood = food.x === x && food.y === y;
            return (
              <div
                key={i}
                className={`w-8 h-8 rounded-sm ${
                  isSnakePart
                    ? "bg-[#FF00FF] transition-all animate-bounce"
                    : isFood
                    ? "bg-[#00FFFF] transition-all animate-pulse"
                    : "bg-[#333]"
                }`}
              ></div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-6 text-[#00FFFF]">
          <div>
            <span>Score: {score}</span>
          </div>
          <div>
            <span>High Score: {highScore}</span>
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-white">Game Over</h2>
            <Button
              onClick={resetGame}
              className="mt-4 text-lg bg-[#FF00FF] text-white px-6 py-2 rounded-lg hover:bg-[#00FFFF] transition-all"
            >
              Restart
            </Button>
          </div>
        </div>
      )}
                  {/* Footer section */}
                  <footer className="mt-4 text-sm text-muted-foreground">
        Created By Ismail Ahmed Shah
      </footer>
    </div>
  );
}
