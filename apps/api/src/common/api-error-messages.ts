import type { ApiErrorCode } from '@stridemon/shared/domain'

/**
 * One human-readable message per code. A `Record` over the union means adding a
 * code without a message fails the typecheck. Clients show these but never parse them.
 */
export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  VALIDATION_FAILED: 'The request is invalid.',
  UNAUTHENTICATED: 'You need to sign in first.',
  NOT_FOUND: 'That resource does not exist.',
  RATE_LIMITED: 'Too many requests. Please slow down and try again shortly.',
  INTERNAL_ERROR: 'Something went wrong on our side.',
  INVALID_SIGNATURE: 'The signature does not match a sign-in message this server issued.',
  NONCE_EXPIRED: 'This sign-in request has expired or was already used. Start signing in again.',
  REFRESH_TOKEN_REVOKED: 'This sign-in was revoked. Sign in again with your wallet.',
  SNEAKER_NOT_OWNED: 'This wallet doesn’t own that Sneaker.',
  SNEAKER_OUT_OF_ENERGY: 'This Sneaker has no energy left. It regenerates over time.',
  SNEAKER_NEEDS_REPAIR: 'This Sneaker is worn out. Repair it before your next run.',
  ACTIVITY_SESSION_ALREADY_ACTIVE: 'You already have a run in progress. Finish it first.',
  ACTIVITY_SESSION_NOT_ACTIVE: 'This run has already ended.',
  MOCK_LOCATION_DETECTED: 'This run used a simulated location, so it can’t earn rewards.',
  INSUFFICIENT_ACTIVITY_DATA: 'There wasn’t enough GPS data to count this run.',
  SNEAKER_TRANSFERRED_DURING_SESSION:
    'The Sneaker changed owner during this run, so it can’t earn rewards.',
  TURNSTILE_FAILED: 'The quick robot check didn’t pass. Let it reload, then try again.',
  EMAIL_CODE_RECENTLY_SENT:
    'We just sent you a code. Check your inbox, or ask for a new one in a minute.',
  EMAIL_SEND_FAILED: 'We couldn’t send the email just now. Try again in a minute.',
  EMAIL_CODE_INCORRECT: 'That code isn’t right. Check the latest email and try again.',
  EMAIL_CODE_EXPIRED: 'This code has expired or was already used. Ask for a new one.',
  EMAIL_CODE_TOO_MANY_ATTEMPTS: 'Too many wrong tries for this code. Ask for a new one.',
  EMAIL_PROOF_INVALID: 'Your email check has run out. Check your email again to mint.',
  PASS_MINT_NOT_OPEN: 'Minting hasn’t opened yet. Join the waitlist to mint in the first 48 hours.',
  PASS_WAITLIST_WINDOW_ONLY:
    'Right now only people on the waitlist can mint. Everyone can mint when the open mint starts.',
  PASS_ALL_MINTED: 'All 1,000 Founding Passes are minted. Get the app: it’s open to everyone.',
  PASS_MINT_CLOSED: 'Minting has closed. Get the app: it’s open to everyone, with a free Sneaker.',
  PASS_EMAIL_ALREADY_USED: 'This email already has a Founding Pass. It’s one pass per person.',
  PASS_WALLET_ALREADY_USED: 'This wallet already has a Founding Pass. It’s one pass per wallet.',
  PASS_ALREADY_MINTED: 'Someone just minted this pass. Here are similar ones that are still free.',
  PASS_MINT_FAILED: 'The mint didn’t go through, and nothing was minted. Try again.',
  FOUNDING_PASS_REQUIRED:
    'StrideMon is in early access. Mint a free Founding Pass on stridemon.xyz/pass to get in early.',
}
