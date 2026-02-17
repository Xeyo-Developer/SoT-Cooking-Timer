export function playSound(audioElement: HTMLAudioElement | null): void {
  if (!audioElement) return;

  audioElement.currentTime = 0;

  const promise = audioElement.play();

  if (promise !== undefined) {
    promise.catch((err) => {
      console.log("Audio blocked:", err);
    });
  }
}
