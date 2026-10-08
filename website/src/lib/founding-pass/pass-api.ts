// The browser side of the mint's API routes (D-043, D-045): the app's sign-in, the email check and
// the mint. The site never imports `@stridemon/shared` (D-035), so this mirrors the contracts by
// hand and checks each answer as it reads it. A refusal comes back as its error code, never as a
// thrown error, so every screen can say what happened and what to do next.

import { passApiUrls } from '@/content/site'
import { isRecord } from '../browser-storage'

export type PassApiProblem =
  /** The API answered with its error shape (backend-api.md → Error shape). */
  | { kind: 'apiError'; code: string; details: Record<string, unknown> }
  /** Offline, timed out, blocked, or an answer that isn't ours. */
  | { kind: 'unreachable' }

export type PassApiResult<Data> =
  | { isOk: true; data: Data }
  | { isOk: false; problem: PassApiProblem }

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

const REQUEST_TIMEOUT_MILLISECONDS = 15_000
const WALLET_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/
const TRANSACTION_HASH_PATTERN = /^0x[0-9a-fA-F]{64}$/

export function sendPassEmailCode(
  email: string,
  turnstileToken: string,
): Promise<PassApiResult<null>> {
  return requestJson({
    url: passApiUrls.emailCode,
    method: 'POST',
    body: { email, turnstileToken },
    readData: (body) => (isRecord(body) && body.status === 'sent' ? null : undefined),
  })
}

export function verifyPassEmailCode(
  email: string,
  code: string,
): Promise<PassApiResult<EmailProof>> {
  return requestJson({
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

/** The SIWE message for this wallet to sign, exactly as the API built it. */
export function requestSignInMessage(walletAddress: string): Promise<PassApiResult<string>> {
  return requestJson({
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
): Promise<PassApiResult<SignInTokens>> {
  return requestJson({
    url: passApiUrls.authVerify,
    method: 'POST',
    body: { message, signature },
    readData: readSignInTokens,
  })
}

/** A new pair: the refresh token is single-use, so the caller stores the new one at once. */
export function refreshSignInTokens(refreshToken: string): Promise<PassApiResult<SignInTokens>> {
  return requestJson({
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
): Promise<PassApiResult<PassMint>> {
  return requestJson({
    url: passApiUrls.mints,
    method: 'POST',
    body: { designNumber, emailProof, turnstileToken },
    accessToken,
    readData: readMintResponse,
  })
}

export function readPassMint(
  mintId: string,
  accessToken: string,
): Promise<PassApiResult<PassMint>> {
  return requestJson({
    url: `${passApiUrls.mints}/${encodeURIComponent(mintId)}`,
    method: 'GET',
    accessToken,
    readData: readMintResponse,
  })
}

/** The error code, when the problem is the API's own answer. */
export function readProblemCode(problem: PassApiProblem): string | null {
  return problem.kind === 'apiError' ? problem.code : null
}

async function requestJson<Data>({
  url,
  method,
  body,
  accessToken,
  readData,
}: {
  url: string
  method: 'GET' | 'POST'
  body?: Record<string, unknown>
  accessToken?: string
  /** The data, or `undefined` when the answer isn't the expected shape. */
  readData: (body: unknown) => Data | undefined
}): Promise<PassApiResult<Data>> {
  let response: Response
  let responseBody: unknown
  try {
    response = await fetch(url, {
      method,
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(accessToken === undefined ? {} : { authorization: `Bearer ${accessToken}` }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    })
    responseBody = await response.json()
  } catch {
    return { isOk: false, problem: { kind: 'unreachable' } }
  }
  if (!response.ok) {
    const apiError = isRecord(responseBody) ? responseBody.error : undefined
    if (isRecord(apiError) && typeof apiError.code === 'string') {
      return {
        isOk: false,
        problem: {
          kind: 'apiError',
          code: apiError.code,
          details: isRecord(apiError.details) ? apiError.details : {},
        },
      }
    }
    return { isOk: false, problem: { kind: 'unreachable' } }
  }
  const data = readData(responseBody)
  return data === undefined
    ? { isOk: false, problem: { kind: 'unreachable' } }
    : { isOk: true, data }
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
