import { createHash } from 'node:crypto'

/**
 * SHA-256 of a refresh token, as hex. Only this hash is stored, so a database
 * leak doesn't hand out working tokens. A plain hash (no salt or stretching) is
 * enough because the token is 32 random bytes, not a guessable password.
 */
export function hashRefreshToken(refreshToken: string): string {
  return createHash('sha256').update(refreshToken).digest('hex')
}
