import { z } from 'zod'

/** A 20-byte hex address in any letter case. The API checks the checksum where it matters. */
export const walletAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, 'must be a 0x-prefixed 20-byte hex address')
