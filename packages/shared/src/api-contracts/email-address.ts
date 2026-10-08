import { z } from 'zod'

// RFC 5321's limit on a whole address.
const MAX_EMAIL_LENGTH = 254

/** An email address, trimmed and lowercased, as it's stored and compared (data-model.md). */
export const emailAddressSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(MAX_EMAIL_LENGTH))
