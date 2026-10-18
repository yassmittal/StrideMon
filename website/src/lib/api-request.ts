// Every call from this site to the StrideMon API (D-043, D-045, D-056): JSON in and out, checked as
// it's read. A refusal comes back as its error code, never as a thrown error, so every screen can
// say what happened and what to do next.

import { isRecord } from './browser-storage'

export type ApiProblem =
  /** The API answered with its error shape (backend-api.md → Error shape). */
  | { kind: 'apiError'; code: string; details: Record<string, unknown> }
  /** Offline, timed out, blocked, or an answer that isn't ours. */
  | { kind: 'unreachable' }

export type ApiResult<Data> = { isOk: true; data: Data } | { isOk: false; problem: ApiProblem }

const REQUEST_TIMEOUT_MILLISECONDS = 15_000

/** The error code, when the problem is the API's own answer. */
export function readProblemCode(problem: ApiProblem): string | null {
  return problem.kind === 'apiError' ? problem.code : null
}

/** A number the API put in an error's details (`retryAfterSeconds`, `attemptsLeft`). */
export function readProblemDetailNumber(
  problem: ApiProblem,
  detailName: string,
): number | undefined {
  if (problem.kind !== 'apiError') return undefined
  const detail = problem.details[detailName]
  return typeof detail === 'number' ? detail : undefined
}

export async function requestApiJson<Data>({
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
}): Promise<ApiResult<Data>> {
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
