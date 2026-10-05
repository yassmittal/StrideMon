import { randomBytes } from 'node:crypto'

const REFRESH_TOKEN_BYTE_LENGTH = 32

/** 32 random bytes, base64url so it survives headers, JSON and the device keychain unescaped. */
export function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTE_LENGTH).toString('base64url')
}
