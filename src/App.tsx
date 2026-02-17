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

export default function App() {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const [volume, setVolume] = useState<number>(100);
  const [showVolumeModal, setShowVolumeModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timersRef = useRef<Map<number, Timer>>(new Map());

  useEffect(() => {
    setTimeout(() => {
      setRandomBackground();
    }, 100);
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedVolume = await load<number>("volume", 100);
    if (savedVolume !== null) setVolume(savedVolume);
  };

  const saveSettings = async () => {
    await save("volume", volume);
  };

  useEffect(() => {
    saveSettings();
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

    const newTimer: ActiveTimer = {
      id: timerId,
      configId: config.id,
      duration: config.duration,
      timeLeft: config.duration,
      timer: timerInstance,
      isPaused: false,
    };

    setActiveTimers((prev) => [...prev, newTimer]);
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
                    const avgTimeElapsed =
                      configTimers.reduce(
                        (sum, t) => sum + (t.duration - t.timeLeft),
                        0,
                      ) / configTimers.length;
                    return avgTimeElapsed;
                  })()}
                  max={config.duration}
                ></progress>

                <div className="button-group">
                  <button
                    onClick={() => startTimer(config.id)}
                    className="control-button orange"
                    disabled={(() => {
                      const timer = activeTimers.find(
                        (t) => t.configId === config.id,
                      );
                      return timer && !timer.isPaused;
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
                      if (timer) {
                        removeTimer(timer.id);
                      }
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
              <div className="volume-settings-container">
                <button
                  onClick={() => setShowVolumeModal(true)}
                  className="volume-button"
                >
                  <span>🔊</span>
                  <span className="volume-label">Volume Settings</span>
                </button>
              </div>
            </div>

            <div className="credit-text">Built with ❤️ by Xeyo-Developer</div>
          </div>
        </div>
      </div>

      {showVolumeModal && (
        <div className="modal" onClick={() => setShowVolumeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Volume Settings</h2>
            </div>
            <div className="modal-body">
              <div className="volume-control">
                <div className="volume-display">{volume}%</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                />
                <button onClick={testSound} className="test-sound-button">
                  Test Sound
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowVolumeModal(false)}
                className="save-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} preload="auto" src="./alert.mp3" />
    </>
  );
}
