// The browser side of the mint's API routes (D-043, D-045): the app's sign-in, the email check and
// the mint. The site never imports `@stridemon/shared` (D-035), so this mirrors the contracts by
// hand and checks each answer as it reads it. A refusal comes back as its error code, never as a
// thrown error, so every screen can say what happened and what to do next.

import { passApiUrls } from '@/content/site'
import { type ApiResult, requestApiJson } from '../api-request'
import { isRecord } from '../browser-storage'

export type {
  ApiProblem as PassApiProblem,
  ApiResult as PassApiResult,
} from '../api-request'
export { readProblemCode } from '../api-request'

export type EmailProof = {
  email: string
  emailProof: string
  emailProofExpiresAt: string
}

export type SignInTokens = {
  accessToken: string
  refreshToken: string
  /** EIP-55 checksummed. */
  walletAddress: `0x${string}`
}

export type PassMintStatus = 'queued' | 'confirmed' | 'failed'

export type PassMint = {
  mintId: string
  designNumber: number
  status: PassMintStatus
  transactionHash: `0x${string}` | null
  founderNumber: number | null
  hasGoldFrame: boolean | null
  /** Why a failed mint failed: `PASS_ALREADY_MINTED`, `PASS_WALLET_ALREADY_USED` or `PASS_MINT_FAILED`. */
  failureCode: string | null
}

const WALLET_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/
const TRANSACTION_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/

/** What a code email is for: its words, its Turnstile action and the daily limit (D-057). */
export type EmailCodePurpose = 'mint' | 'waitlist'

export function sendPassEmailCode(
  email: string,
  turnstileToken: string,
  purpose: EmailCodePurpose = 'mint',
): Promise<ApiResult<null>> {
  return requestApiJson({
    url: passApiUrls.emailCode,
    method: 'POST',
    body: { email, turnstileToken, purpose },
    readData: (body) => (isRecord(body) && body.status === 'sent' ? null : undefined),
  })
}

export function verifyPassEmailCode(email: string, code: string): Promise<ApiResult<EmailProof>> {
  return requestApiJson({
    url: passApiUrls.emailVerify,
    method: 'POST',
    body: { email, code },
    readData: (body) =>
      isRecord(body) &&
      typeof body.emailProof === 'string' &&
      typeof body.emailProofExpiresAt === 'string'
        ? { email, emailProof: body.emailProof, emailProofExpiresAt: body.emailProofExpiresAt }
        : undefined,
  })
}

/** An email proof from Sign in with Google's ID token, for the email Google gave (D-057). */
export function checkPassEmailWithGoogle(googleIdToken: string): Promise<ApiResult<EmailProof>> {
  return requestApiJson({
    url: passApiUrls.emailGoogle,
    method: 'POST',
    body: { googleIdToken },
    readData: (body) =>
      isRecord(body) &&
      typeof body.email === 'string' &&
      typeof body.emailProof === 'string' &&
      typeof body.emailProofExpiresAt === 'string'
        ? {
            email: body.email,
            emailProof: body.emailProof,
            emailProofExpiresAt: body.emailProofExpiresAt,
          }
        : undefined,
  })
}

/** The SIWE message for this wallet to sign, exactly as the API built it. */
export function requestSignInMessage(walletAddress: string): Promise<ApiResult<string>> {
  return requestApiJson({
    url: passApiUrls.authNonce,
    method: 'POST',
    body: { walletAddress },
    readData: (body) =>
      isRecord(body) && typeof body.message === 'string' ? body.message : undefined,
  })
}

export function verifySignInSignature(
  message: string,
  signature: string,
): Promise<ApiResult<SignInTokens>> {
  return requestApiJson({
    url: passApiUrls.authVerify,
    method: 'POST',
    body: { message, signature },
    readData: readSignInTokens,
  })
}

/** A new pair: the refresh token is single-use, so the caller stores the new one at once. */
export function refreshSignInTokens(refreshToken: string): Promise<ApiResult<SignInTokens>> {
  return requestApiJson({
    url: passApiUrls.authRefresh,
    method: 'POST',
    body: { refreshToken },
    readData: readSignInTokens,
  })
}

export function requestPassMint(
  {
    designNumber,
    emailProof,
    turnstileToken,
  }: { designNumber: number; emailProof: string; turnstileToken: string },
  accessToken: string,
): Promise<ApiResult<PassMint>> {
  return requestApiJson({
    url: passApiUrls.mints,
    method: 'POST',
    body: { designNumber, emailProof, turnstileToken },
    accessToken,
    readData: readMintResponse,
  })
}

export function readPassMint(mintId: string, accessToken: string): Promise<ApiResult<PassMint>> {
  return requestApiJson({
    url: `${passApiUrls.mints}/${encodeURIComponent(mintId)}`,
    method: 'GET',
    accessToken,
    readData: readMintResponse,
  })
}

function readSignInTokens(body: unknown): SignInTokens | undefined {
  if (
    !isRecord(body) ||
    typeof body.accessToken !== 'string' ||
    typeof body.refreshToken !== 'string' ||
    !isRecord(body.user) ||
    typeof body.user.walletAddress !== 'string' ||
    !WALLET_ADDRESS_PATTERN.test(body.user.walletAddress)
  ) {
    return undefined
  }
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    walletAddress: body.user.walletAddress as `0x${string}`,
  }
}

function readMintResponse(body: unknown): PassMint | undefined {
  const mint = isRecord(body) ? body.mint : undefined
  if (
    !isRecord(mint) ||
    typeof mint.mintId !== 'string' ||
    !Number.isInteger(mint.designNumber) ||
    (mint.status !== 'queued' && mint.status !== 'confirmed' && mint.status !== 'failed')
  ) {
    return undefined
  }
  return {
    mintId: mint.mintId,
    designNumber: mint.designNumber as number,
    status: mint.status,
    transactionHash:
      typeof mint.transactionHash === 'string' &&
      TRANSACTION_HASH_PATTERN.test(mint.transactionHash)
        ? (mint.transactionHash as `0x${string}`)
        : null,
    founderNumber: Number.isInteger(mint.founderNumber) ? (mint.founderNumber as number) : null,
    hasGoldFrame: typeof mint.hasGoldFrame === 'boolean' ? mint.hasGoldFrame : null,
    failureCode: typeof mint.failureCode === 'string' ? mint.failureCode : null,
  }
}
