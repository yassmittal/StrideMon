import { describe, expect, it } from 'bun:test'
import { apiErrorResponseSchema } from './api-error'

describe('apiErrorResponseSchema', () => {
  it('accepts a known error code with details', () => {
    const parsed = apiErrorResponseSchema.parse({
      error: { code: 'NOT_FOUND', message: 'No such route.', details: { path: '/nope' } },
    })

    expect(parsed.error.code).toBe('NOT_FOUND')
  })

  it('rejects an error code that is not in the ApiErrorCode union', () => {
    const parseResult = apiErrorResponseSchema.safeParse({
      error: { code: 'SOMETHING_MADE_UP', message: 'Nope.' },
    })

    expect(parseResult.success).toBe(false)
  })
})
