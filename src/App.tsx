import { useState, useRef, useEffect } from "react";
import { Timer } from "./scripts/timer";
import { playSound } from "./scripts/audio";
import { save, load } from "./scripts/storage";
import { setRandomBackground } from "./scripts/background";
import { ProgressElement } from "./types";
import "./App.css";

const TIMER_CONFIGS = [
  {
    id: 1,
    label: "Fish (40s)",
    duration: 40,
    foods: [{ name: "Fish", image: "./food/Fish.png" }],
  },
  {
    id: 2,
    label: "Chicken, Snake, Pork, Shark (60s)",
    duration: 60,
    foods: [
      { name: "Chicken", image: "./food/Chicken.png" },
      { name: "Snake", image: "./food/Snake.png" },
      { name: "Pork", image: "./food/Pork.png" },
      { name: "Shark", image: "./food/Shark.png" },
    ],
  },
  {
    id: 4,
    label: "Trophy Fish (90s)",
    duration: 90,
    foods: [{ name: "Trophy Fish", image: "./food/Fish.png" }],
  },
  {
    id: 3,
    label: "Kraken, Megalodon (120s)",
    duration: 120,
    foods: [
      { name: "Kraken", image: "./food/Kraken.png" },
      { name: "Megalodon", image: "./food/Megalodon.png" },
    ],
  },
  {
    id: 5,
    label: "Sabotage (300s)",
    duration: 300,
    foods: [
      { name: "Banana", image: "./food/Banana.png" },
      { name: "Coconut", image: "./food/Coconut.png" },
      { name: "Pomegranate", image: "./food/Pomegranate.png" },
      { name: "Mango", image: "./food/Mango.png" },
      { name: "Pineapple", image: "./food/Pineapple.png" },
    ],
    isSabotage: true,
  },
];

interface ActiveTimer {
  id: number;
  configId: number;
  duration: number;
  timeLeft: number;
  timer: Timer | null;
  isPaused: boolean;
}

function VolumeIcon({ volume }: { volume: number }) {
  const muted = volume === 0;

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 9H7L13 4V20L7 15H3V9Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {!muted && (
        <>
          <path
            d="M16 9.5C16.8 10.3 17.3 11.1 17.3 12C17.3 12.9 16.8 13.7 16 14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          {volume >= 40 && (
            <path
              d="M18.5 7C20 8.5 21 10.2 21 12C21 13.8 20 15.5 18.5 17"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </>
      )}

      {muted && (
        <>
          <line
            x1="16"
            y1="9"
            x2="21"
            y2="15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="21"
            y1="9"
            x2="16"
            y2="15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function App() {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [volume, setVolume] = useState<number>(() =>
    load<number>("volume", 100),
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const timersRef = useRef<Map<number, Timer>>(new Map());

  useEffect(() => {
    setTimeout(() => setRandomBackground(), 100);
  }, []);

  useEffect(() => {
    save("volume", volume);
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prev) =>
        prev
          .map((timer) => {
            const timerInstance = timersRef.current.get(timer.id);
            if (timerInstance) {
              return { ...timer, timeLeft: timerInstance.timeLeft };
            }
            return timer;
          })
          .filter((timer) => timer.timeLeft > 0),
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const startTimer = (configId: number) => {
    const config = TIMER_CONFIGS.find((c) => c.id === configId);
    if (!config) return;

    const existingTimer = activeTimers.find((t) => t.configId === configId);
    if (existingTimer) {
      if (existingTimer.isPaused) {
        const timerInstance = timersRef.current.get(existingTimer.id);
        if (timerInstance) {
          timerInstance.start();
          setActiveTimers((prev) =>
            prev.map((t) =>
              t.id === existingTimer.id ? { ...t, isPaused: false } : t,
            ),
          );
        }
      }
      return;
    }

    const timerId = Date.now();
    const progressElement: ProgressElement = { value: 0, max: config.duration };
    const timerInstance = new Timer(config.duration, progressElement, () =>
      handleTimerComplete(timerId),
    );

    timerInstance.start();
    timersRef.current.set(timerId, timerInstance);

    setActiveTimers((prev) => [
      ...prev,
      {
        id: timerId,
        configId: config.id,
        duration: config.duration,
        timeLeft: config.duration,
        timer: timerInstance,
        isPaused: false,
      },
    ]);
  };

  const handleTimerComplete = (timerId: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      playSound(audioRef.current);
    }
    timersRef.current.delete(timerId);
  };

  const stopTimer = (timerId: number) => {
    const timerInstance = timersRef.current.get(timerId);
    if (timerInstance) {
      timerInstance.stop();
      setActiveTimers((prev) =>
        prev.map((t) => (t.id === timerId ? { ...t, isPaused: true } : t)),
      );
    }
  };

  const removeTimer = (timerId: number) => {
    const timerInstance = timersRef.current.get(timerId);
    if (timerInstance) {
      timerInstance.stop();
      timersRef.current.delete(timerId);
    }
    setActiveTimers((prev) => prev.filter((t) => t.id !== timerId));
  };

  const testSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      playSound(audioRef.current);
    }
  };

  return (
    <>
      <div className="min-h-screen text-white">
        <div className="container">
          <h1>Sea Of Thieves Cooking Timer</h1>

          <div className="timers-grid">
            {TIMER_CONFIGS.map((config) => (
              <div
                key={config.id}
                className={`timer-container ${config.isSabotage ? "sabotage-timer" : ""}`}
              >
                <div className="timer-row">
                  <div className="timer-label">{config.label}</div>
                  <div className="food-icons">
                    {config.foods.map((food, idx) => (
                      <img
                        key={idx}
                        src={food.image}
                        alt={food.name}
                        title={food.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {config.isSabotage && (
                  <h5 className="sabotage-title">
                    Jump on an enemy ship and put a fruit on the stove to let
                    the ship burn!
                  </h5>
                )}

                <progress
                  className="progress-bar"
                  value={(() => {
                    const configTimers = activeTimers.filter(
                      (t) => t.configId === config.id,
                    );
                    if (configTimers.length === 0) return 0;
                    return (
                      configTimers.reduce(
                        (sum, t) => sum + (t.duration - t.timeLeft),
                        0,
                      ) / configTimers.length
                    );
                  })()}
                  max={config.duration}
                />

                <div className="button-group">
                  <button
                    onClick={() => startTimer(config.id)}
                    className="control-button orange"
                    disabled={(() => {
                      const timer = activeTimers.find(
                        (t) => t.configId === config.id,
                      );
                      return timer !== undefined && !timer.isPaused;
                    })()}
                  >
                    Start
                  </button>
                  <button
                    onClick={() => {
                      const timer = activeTimers.find(
                        (t) => t.configId === config.id,
                      );
                      if (timer) stopTimer(timer.id);
                    }}
                    className="control-button yellow"
                    disabled={(() => {
                      const timer = activeTimers.find(
                        (t) => t.configId === config.id,
                      );
                      return !timer || timer.isPaused;
                    })()}
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => {
                      const timer = activeTimers.find(
                        (t) => t.configId === config.id,
                      );
                      if (timer) removeTimer(timer.id);
                    }}
                    className="control-button red"
                    disabled={
                      !activeTimers.some((t) => t.configId === config.id)
                    }
                  >
                    Reset
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="controls-card">
            <div className="controls-row">
              <div className="volume-inline">
                <div className="volume-icon-wrap">
                  <button
                    className="volume-icon-btn"
                    onClick={testSound}
                    aria-label="Test sound"
                  >
                    <VolumeIcon volume={volume} />
                  </button>
                  <span className="volume-tooltip">Click to test sound</span>
                </div>
                <input
                  className="volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
                <span className="volume-value">{volume}%</span>
              </div>
            </div>

            <div className="credit-text">Built with ❤️ by Xeyo-Developer</div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" src="./alert.mp3" />
    </>
  );
}
