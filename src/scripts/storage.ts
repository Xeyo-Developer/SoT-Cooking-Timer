export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage save failed:", error);
  }
}

export function load<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn("Storage load failed:", error);
    return defaultValue;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Storage remove failed:", error);
  }
}
