import { randomBytes } from 'node:crypto'

// EIP-4361 needs at least 8 alphanumeric characters. 16 bytes is 32 hex characters.
const SIWE_NONCE_BYTE_LENGTH = 16

/**
 * A cryptographically random, alphanumeric SIWE nonce. viem's `generateSiweNonce`
 * is not used because it draws from `Math.random`.
 */
export function generateSiweNonce(): string {
  return randomBytes(SIWE_NONCE_BYTE_LENGTH).toString('hex')
}
