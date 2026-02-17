interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

declare global {
  interface Window {
    storage?: {
      get(key: string, shared: boolean): Promise<StorageResult | null>;
      set(
        key: string,
        value: string,
        shared: boolean,
      ): Promise<StorageResult | null>;
      delete(
        key: string,
        shared: boolean,
      ): Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
      list(
        prefix?: string,
        shared?: boolean,
      ): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
    };
  }
}

const memoryStorage: Record<string, any> = {};

export async function save(key: string, value: any): Promise<void> {
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(key, JSON.stringify(value), false);
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      memoryStorage[key] = value;
    }
  } catch (error) {
    console.warn("Storage save failed, using memory:", error);
    memoryStorage[key] = value;
  }
}

export async function load<T>(
  key: string,
  defaultValue: T | null = null,
): Promise<T | null> {
  try {
    if (typeof window !== "undefined" && window.storage) {
      const result = await window.storage.get(key, false);
      return result ? JSON.parse(result.value) : defaultValue;
    } else if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } else {
      return memoryStorage[key] !== undefined
        ? memoryStorage[key]
        : defaultValue;
    }
  } catch (error) {
    console.warn("Storage load failed, using memory:", error);
    return memoryStorage[key] !== undefined ? memoryStorage[key] : defaultValue;
  }
}

export async function remove(key: string): Promise<void> {
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.delete(key, false);
    } else if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  } catch (error) {
    console.warn("Storage remove failed:", error);
    delete memoryStorage[key];
  }
}
