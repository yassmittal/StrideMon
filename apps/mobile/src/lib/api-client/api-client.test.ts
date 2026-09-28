import { healthResponseSchema } from '@stridemon/shared/api-contracts'
import { requestJson } from './api-client'
import { ApiError } from './api-error'

const fetchMock = jest.spyOn(globalThis, 'fetch')

function buildJsonResponse(statusCode: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}

function requestHealth() {
  return requestJson({ method: 'GET', path: '/health', responseSchema: healthResponseSchema })
}

async function captureRejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('Expected the request to fail')
}

describe('requestJson', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('returns the parsed body on success', async () => {
    fetchMock.mockResolvedValue(buildJsonResponse(200, { status: 'ok', mongo: 'connected' }))

    await expect(requestHealth()).resolves.toEqual({ status: 'ok', mongo: 'connected' })
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.test/health')
  })

  it('rejects with the API error code when the API returns an error body', async () => {
    fetchMock.mockResolvedValue(
      buildJsonResponse(429, {
        error: { code: 'RATE_LIMITED', message: 'Slow down.', details: { retryAfterSeconds: 30 } },
      }),
    )

    const apiError = await captureRejection(requestHealth())

    expect(apiError.code).toBe('RATE_LIMITED')
    expect(apiError.statusCode).toBe(429)
    expect(apiError.details).toEqual({ retryAfterSeconds: 30 })
  })

  it('rejects with NETWORK_UNREACHABLE when the request never gets a response', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))

    const apiError = await captureRejection(requestHealth())

    expect(apiError.code).toBe('NETWORK_UNREACHABLE')
    expect(apiError.statusCode).toBeNull()
  })

  it('rejects with UNEXPECTED_RESPONSE when a success body does not match the schema', async () => {
    fetchMock.mockResolvedValue(buildJsonResponse(200, { status: 'maybe' }))

    const apiError = await captureRejection(requestHealth())

    expect(apiError.code).toBe('UNEXPECTED_RESPONSE')
  })
})
