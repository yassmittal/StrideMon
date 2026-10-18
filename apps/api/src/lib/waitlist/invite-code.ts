import { createHmac } from 'node:crypto'
import { INVITE_CODE_LENGTH } from '@stridemon/shared/domain'
import { foldEmailAddress } from './canonical-email'

// Crockford's base32: no I, L, O or U, so a code read aloud or copied by hand stays right.
const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const BITS_PER_CHARACTER = 5
const INVITE_PAGE_URL = 'https://stridemon.xyz/waitlist'

/**
 * A sign-up's invite code (D-056): 8 Crockford base32 characters (40 bits) cut from
 * HMAC-SHA256(canonical email, secret). The same email always gets the same code, so joining
 * answers a new and a repeat email alike, and nobody can work out a code from an email.
 */
export function buildInviteCode({
  canonicalEmail,
  inviteCodeSecret,
}: {
  canonicalEmail: string
  inviteCodeSecret: string
}): string {
  const digest = createHmac('sha256', inviteCodeSecret).update(canonicalEmail).digest()
  let inviteCode = ''
  for (let characterIndex = 0; characterIndex < INVITE_CODE_LENGTH; characterIndex += 1) {
    inviteCode += CROCKFORD_BASE32_ALPHABET[readBits(digest, characterIndex * BITS_PER_CHARACTER)]
  }
  return inviteCode
}

/** The link a sign-up shares: `https://stridemon.xyz/waitlist?ref=<code>`. */
export function buildInviteUrl(inviteCode: string): string {
  return `${INVITE_PAGE_URL}?ref=${inviteCode}`
}

/** Five bits of `bytes`, starting at bit `bitOffset` (most significant bit first). */
function readBits(bytes: Uint8Array, bitOffset: number): number {
  let value = 0
  for (let bitIndex = bitOffset; bitIndex < bitOffset + BITS_PER_CHARACTER; bitIndex += 1) {
    const byte = bytes[Math.floor(bitIndex / 8)] ?? 0
    value = (value << 1) | ((byte >> (7 - (bitIndex % 8))) & 1)
  }
  return value
}

/** A sign-up's inbox and its code, both from the email as typed (D-056). */
export function buildWaitlistInviteIdentity({
  email,
  inviteCodeSecret,
}: {
  email: string
  inviteCodeSecret: string
}): { canonicalEmail: string; inviteCode: string } {
  const canonicalEmail = foldEmailAddress(email)
  return { canonicalEmail, inviteCode: buildInviteCode({ canonicalEmail, inviteCodeSecret }) }
}
