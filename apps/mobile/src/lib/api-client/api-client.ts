import { apiErrorResponseSchema } from '@stridemon/shared/api-contracts'
import { getErrorMessage } from '@stridemon/shared/errors'
import type { z } from 'zod'
import { appEnvironment } from '../../config/env'
import { readRegisteredAccessTokenSource } from './access-token-source'
import { ApiError } from './api-error'

// A wrong LAN IP otherwise hangs for the OS default (often over a minute).
const REQUEST_TIMEOUT_MILLISECONDS = 15_000
const HTTP_STATUS_UNAUTHORIZED = 401

type RequestJsonOptions<ResponseSchema extends z.ZodType> = {
  method: 'GET' | 'POST'
  path: `/${string}`
  responseSchema: ResponseSchema
  body?: unknown
  /** Sends the access token, and on a 401 refreshes it once and retries once. */
  requiresAuthentication?: boolean
}

/**
 * The app's only `fetch`. Sends JSON to the StrideMon API, parses the reply with
 * the shared zod schema, and turns every failure into an `ApiError`.
 */
export async function requestJson<ResponseSchema extends z.ZodType>(
  options: RequestJsonOptions<ResponseSchema>,
): Promise<z.infer<ResponseSchema>> {
  if (options.requiresAuthentication !== true) return sendJsonRequest(options, null)

  const accessTokenSource = readRegisteredAccessTokenSource()
  if (accessTokenSource === null) throw buildSignedOutError()

  const accessToken =
    accessTokenSource.readAccessToken() ?? (await accessTokenSource.refreshAccessToken())
  if (accessToken === null) throw buildSignedOutError()

  try {
    return await sendJsonRequest(options, accessToken)
  } catch (error) {
    if (!(error instanceof ApiError) || error.statusCode !== HTTP_STATUS_UNAUTHORIZED) throw error
    const refreshedAccessToken = await accessTokenSource.refreshAccessToken()
    if (refreshedAccessToken === null) throw error
    return sendJsonRequest(options, refreshedAccessToken)
  }
}

async function sendJsonRequest<ResponseSchema extends z.ZodType>(
  { method, path, responseSchema, body }: RequestJsonOptions<ResponseSchema>,
  accessToken: string | null,
): Promise<z.infer<ResponseSchema>> {
  const response = await fetchWithTimeout(`${appEnvironment.apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken === null ? {} : { Authorization: `Bearer ${accessToken}` }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  const responseBody = await readJsonBody(response)
  if (!response.ok) throw toApiError(response.status, responseBody)

  const parseResult = responseSchema.safeParse(responseBody)
  if (!parseResult.success) {
    throw new ApiError({
      code: 'UNEXPECTED_RESPONSE',
      message: `The API sent a response this app version doesn't understand (${method} ${path}).`,
      statusCode: response.status,
    })
  }
  return parseResult.data
}

function buildSignedOutError(): ApiError {
  return new ApiError({
    code: 'UNAUTHENTICATED',
    message: 'You are signed out. Sign in with your wallet to continue.',
    statusCode: null,
  })
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const abortController = new AbortController()
  const timeoutHandle = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MILLISECONDS)
  try {
    return await fetch(url, { ...init, signal: abortController.signal })
  } catch (error) {
    throw new ApiError({
      code: 'NETWORK_UNREACHABLE',
      message: `Can't reach the StrideMon API at ${appEnvironment.apiBaseUrl}: ${getErrorMessage(error)}`,
      statusCode: null,
    })
  } finally {
    clearTimeout(timeoutHandle)
  }
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function toApiError(statusCode: number, responseBody: unknown): ApiError {
  const parseResult = apiErrorResponseSchema.safeParse(responseBody)
  if (!parseResult.success) {
    return new ApiError({
      code: 'UNEXPECTED_RESPONSE',
      message: `The API failed with HTTP ${statusCode} and no readable error.`,
      statusCode,
    })
  }
  const { code, message, details } = parseResult.data.error
  return new ApiError({ code, message, statusCode, details })
}
