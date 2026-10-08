// Small JSON values in this browser's `localStorage`. Storage can be missing or blocked (a private
// window, cleared site data), so every read and write is wrapped: a failed read is "nothing
// stored", and a failed write only means the value lasts until the tab closes.

export function readStoredValue<Value>(
  storageKey: string,
  isValue: (storedValue: unknown) => storedValue is Value,
): Value | null {
  try {
    const storedText = window.localStorage.getItem(storageKey)
    if (storedText === null) return null
    const storedValue: unknown = JSON.parse(storedText)
    return isValue(storedValue) ? storedValue : null
  } catch {
    return null
  }
}

export function writeStoredValue(storageKey: string, value: unknown): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    // Full or blocked: the value still lives in memory for this visit.
  }
}

export function removeStoredValue(storageKey: string): void {
  try {
    window.localStorage.removeItem(storageKey)
  } catch {
    // Blocked: nothing was stored anyway.
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
