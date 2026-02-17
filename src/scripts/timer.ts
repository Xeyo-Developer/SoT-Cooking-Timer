import { ProgressElement } from "../types";

export class Timer {
  duration: number;
  timeLeft: number;
  interval: number | null;
  started: boolean;
  progressBar: ProgressElement | null;
  onFinish: (() => void) | null;

  constructor(
    duration: number,
    progressBar: ProgressElement | null,
    onFinish: (() => void) | null,
  ) {
    this.duration = duration;
    this.timeLeft = duration;
    this.interval = null;
    this.started = false;
    this.progressBar = progressBar;
    this.onFinish = onFinish;
  }

  start(): void {
    if (this.started) return;

    this.started = true;
    this.interval = window.setInterval(() => this.update(), 1000);
  }

  stop(): void {
    if (!this.started) return;

    if (this.interval !== null) {
      clearInterval(this.interval);
    }
    this.started = false;
  }

  reset(): void {
    this.stop();
    this.timeLeft = this.duration;
    if (this.progressBar) this.progressBar.value = 0;
  }

  update(): void {
    if (this.timeLeft <= 0) {
      this.finish();
      return;
    }

    this.timeLeft--;

    if (this.progressBar) {
      this.progressBar.value = this.duration - this.timeLeft;
    }
  }

  finish(): void {
    this.stop();
    this.timeLeft = 0;

    if (this.onFinish) {
      this.onFinish();
    }
  }
}
