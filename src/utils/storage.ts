/**
 * Storage Utility — localStorage wrapper with error handling
 *
 * Provides safe get/set/remove operations that won't throw
 * if localStorage is unavailable (e.g., in sandboxed iframes).
 */

const PREFIX = 'sql-mystery:';

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // silently fail
  }
}

/**
 * Get the total size of all sql-mystery keys in localStorage (bytes).
 * Useful for debugging storage limits.
 */
export function storageUsage(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) {
        total += (localStorage.getItem(key) ?? '').length * 2; // UTF-16
      }
    }
    return total;
  } catch {
    return 0;
  }
}
