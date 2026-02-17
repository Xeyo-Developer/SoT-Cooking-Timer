export interface FoodItem {
  name: string;
  time: number;
  emoji: string;
  color: string;
  icon?: string;
}

export interface TimerData {
  id: number;
  foodName: string;
  emoji: string;
  color: string;
  duration: number;
  timeLeft: number;
  started: boolean;
  paused: boolean;
}

export interface ProgressElement {
  value: number;
  max?: number;
}
