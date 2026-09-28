import type { ApiErrorResponse } from '@stridemon/shared/api-contracts'
import type { FastifyError } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { ApiError, type ApiErrorDetails } from '../common/api-error'

const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

/** The single place that shapes error responses. Stack traces never leave the server. */
export const errorHandlerPlugin = fastifyPlugin(
  async (fastify) => {
    fastify.setErrorHandler((error: FastifyError | ApiError, request, reply) => {
      const apiError = toApiError(error)
      if (apiError.statusCode >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
        request.log.error({ err: error }, 'Request failed')
      }
      return reply.status(apiError.statusCode).send(toErrorResponseBody(apiError))
    })

    fastify.setNotFoundHandler((request, reply) => {
      const apiError = new ApiError('NOT_FOUND', 404, { method: request.method, path: request.url })
      return reply.status(apiError.statusCode).send(toErrorResponseBody(apiError))
    })
  },
  { name: 'error-handler' },
)

function toApiError(error: FastifyError | ApiError): ApiError {
  if (error instanceof ApiError) return error

  if (hasZodFastifySchemaValidationErrors(error)) {
    return new ApiError('VALIDATION_FAILED', HTTP_STATUS_BAD_REQUEST, {
      issues: error.validation.map((validationIssue) => ({
        location: error.validationContext,
        path: validationIssue.instancePath,
        message: validationIssue.message,
      })),
    })
  }

  // Fastify's own 4xx errors: malformed JSON, oversized body, wrong content type.
  const statusCode = error.statusCode ?? HTTP_STATUS_INTERNAL_SERVER_ERROR
  if (statusCode < HTTP_STATUS_INTERNAL_SERVER_ERROR) {
    return new ApiError('VALIDATION_FAILED', statusCode, { reason: error.message })
  }

  return new ApiError('INTERNAL_ERROR', HTTP_STATUS_INTERNAL_SERVER_ERROR)
}

function toErrorResponseBody(apiError: ApiError): ApiErrorResponse {
  const details: ApiErrorDetails | undefined = apiError.details
  return {
    error: {
      code: apiError.code,
      message: apiError.message,
      ...(details === undefined ? {} : { details }),
    },
  }
}
