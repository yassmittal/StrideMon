import * as SecureStore from 'expo-secure-store'

// Keychain (iOS) / Keystore-encrypted (Android). Never AsyncStorage: security.md → Mobile.
const REFRESH_TOKEN_STORAGE_KEY = 'stridemon.refreshToken'

export function readStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY)
}

export function storeRefreshToken(refreshToken: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
}

export function deleteStoredRefreshToken(): Promise<void> {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY)
}
