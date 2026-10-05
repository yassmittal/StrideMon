import { z } from 'zod'

// A uint256 has at most 78 decimal digits.
const MAXIMUM_TOKEN_ID_DIGITS = 78

/** An NFT token id (`uint256`) as a decimal string, since JSON numbers lose precision above 2^53. */
export const tokenIdStringSchema = z
  .string()
  .regex(
    new RegExp(`^(0|[1-9]\\d{0,${MAXIMUM_TOKEN_ID_DIGITS - 1}})$`),
    'must be a token id as a decimal string',
  )
