import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage failures must never crash the UI. Callers get null on failure and
// fall back to defaults.
export async function readStoredValue(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function writeStoredValue(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Preferences are non-critical. The in-memory value still applies.
  }
}

// Corrupt or outdated JSON is treated as "nothing stored", never as an error.
export async function readStoredJson<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): Promise<T | null> {
  const raw = await readStoredValue(key);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown): Promise<void> {
  return writeStoredValue(key, JSON.stringify(value));
}

export async function removeStoredValue(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Eviction is best-effort. A leftover entry only uses a little space.
  }
}
