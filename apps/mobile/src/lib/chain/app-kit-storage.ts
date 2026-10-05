import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Storage } from '@reown/appkit-react-native'

/**
 * Where AppKit keeps the wallet connection between launches. AsyncStorage is not
 * encrypted, which is fine for a WalletConnect pairing but never for auth tokens
 * (those go in expo-secure-store).
 */
export const appKitStorage: Storage = {
  getKeys: async () => [...(await AsyncStorage.getAllKeys())],
  getEntries: async <Value>() => {
    const keys = await AsyncStorage.getAllKeys()
    const keyValuePairs = await AsyncStorage.multiGet(keys)
    return keyValuePairs.map(([key, storedText]): [string, Value] => [
      key,
      parseStoredValue<Value>(storedText),
    ])
  },
  getItem: async <Value>(key: string) => {
    const storedText = await AsyncStorage.getItem(key)
    return storedText === null ? undefined : parseStoredValue<Value>(storedText)
  },
  setItem: async <Value>(key: string, value: Value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key)
  },
}

function parseStoredValue<Value>(storedText: string | null): Value {
  // AppKit wrote this value itself with JSON.stringify, so it reads back as the type it asks for.
  return (storedText === null ? undefined : JSON.parse(storedText)) as Value
}
