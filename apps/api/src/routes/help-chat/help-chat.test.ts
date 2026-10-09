import { afterEach, describe, expect, it } from 'bun:test'
import { apiErrorResponseSchema, askHelpChatResponseSchema } from '@stridemon/shared/api-contracts'
import type { FastifyInstance } from 'fastify'
import type { HelpChatModelMessage } from '../../lib/help-chat/build-help-chat-prompt'
import { toHelpChatUsageMonth } from '../../lib/help-chat/help-chat-cost'
import { getHelpChatUsageCollection } from '../../repositories/help-chat-usage-repository'
import type { HelpChatModel } from '../../services/help-chat-model'
import { buildTestServer, TEST_WAITLIST_ALLOWED_ORIGIN } from '../../test-support/build-test-server'

const RECOVERY_PHRASE =
  'abandon ability able about above absent absorb abstract absurd abuse access accident'
const TRANSACTION_HASH = `0x${'5c'.repeat(32)}`

/** A model that answers the same thing every time and remembers what it was sent. */
function createFakeHelpChatModel(modelText = 'Look in spam.\nTOPICS: code-not-arriving, made-up') {
  const sentConversations: HelpChatModelMessage[][] = []
  const helpChatModel: HelpChatModel = {
    completeHelpChat: async (messages) => {
      sentConversations.push([...messages])
      return { modelText, inputTokenCount: 4_000, outputTokenCount: 50 }
    },
  }
  return { helpChatModel, sentConversations }
}

describe('POST /v1/help/chat', () => {
  let server: FastifyInstance

  afterEach(async () => {
    await server.close()
  })

  function askHelpChat(messages: { role: 'visitor' | 'assistant'; text: string }[]) {
    return server.inject({ method: 'POST', url: '/v1/help/chat', payload: { messages } })
  }

  function readMonthUsage() {
    return getHelpChatUsageCollection(server.mongo.database).findOne({
      _id: toHelpChatUsageMonth(new Date()),
    })
  }

  it('answers from the model, keeps only help page topics, and counts the tokens', async () => {
    const { helpChatModel, sentConversations } = createFakeHelpChatModel()
    server = await buildTestServer({ helpChatModel })

    const response = await askHelpChat([{ role: 'visitor', text: 'The code didn’t arrive' }])

    expect(response.statusCode).toBe(200)
    expect(askHelpChatResponseSchema.parse(response.json())).toEqual({
      status: 'answered',
      answerText: 'Look in spam.',
      helpTopicIds: ['code-not-arriving'],
    })
    expect(sentConversations[0]?.[0]?.role).toBe('system')
    expect(sentConversations[0]?.[0]?.content).toContain('[topic code-not-arriving]')
    expect(await readMonthUsage()).toMatchObject({
      inputTokenCount: 4_000,
      outputTokenCount: 50,
      answerCount: 1,
    })
  })

  it('answers a recovery phrase itself, without the model or any cost', async () => {
    const { helpChatModel, sentConversations } = createFakeHelpChatModel()
    server = await buildTestServer({ helpChatModel })

    const response = await askHelpChat([
      { role: 'visitor', text: `my seed phrase is ${RECOVERY_PHRASE}` },
    ])

    const answer = askHelpChatResponseSchema.parse(response.json())
    expect(answer.status === 'answered' && answer.answerText).toContain('keep that secret')
    expect(sentConversations).toHaveLength(0)
    expect(await readMonthUsage()).toBeNull()
  })

  it('removes secrets and transaction hashes before anything reaches the model', async () => {
    const { helpChatModel, sentConversations } = createFakeHelpChatModel()
    server = await buildTestServer({ helpChatModel })

    await askHelpChat([
      { role: 'visitor', text: RECOVERY_PHRASE },
      { role: 'assistant', text: 'Please keep that secret.' },
      { role: 'visitor', text: `My mint is slow: ${TRANSACTION_HASH}` },
    ])

    const sentText = JSON.stringify(sentConversations[0])
    expect(sentText).not.toContain('abandon ability')
    expect(sentText).not.toContain(TRANSACTION_HASH)
    expect(sentText).toContain('My mint is slow: [removed]')
  })

  it('stops asking the model once the month’s cap is spent', async () => {
    const { helpChatModel, sentConversations } = createFakeHelpChatModel()
    server = await buildTestServer({
      helpChatModel,
      environmentOverrides: { HELP_CHAT_MONTHLY_CAP_USD: '1' },
    })
    // 2 million input tokens at $0.62 a million is $1.24, past the $1 cap.
    await getHelpChatUsageCollection(server.mongo.database).insertOne({
      _id: toHelpChatUsageMonth(new Date()),
      inputTokenCount: 2_000_000,
      outputTokenCount: 0,
      answerCount: 400,
      updatedAt: new Date(),
    })

    const response = await askHelpChat([{ role: 'visitor', text: 'Is it free?' }])

    expect(response.statusCode).toBe(200)
    expect(askHelpChatResponseSchema.parse(response.json())).toEqual({
      status: 'monthlyCapReached',
    })
    expect(sentConversations).toHaveLength(0)
  })

  it('answers HELP_CHAT_UNAVAILABLE when there is no model', async () => {
    server = await buildTestServer()

    const response = await askHelpChat([{ role: 'visitor', text: 'Is it free?' }])

    expect(response.statusCode).toBe(503)
    expect(apiErrorResponseSchema.parse(response.json()).error.code).toBe('HELP_CHAT_UNAVAILABLE')
  })

  it('refuses a conversation that doesn’t end with a question, or is too long', async () => {
    server = await buildTestServer({ helpChatModel: createFakeHelpChatModel().helpChatModel })

    const endsWithAnswer = await askHelpChat([{ role: 'assistant', text: 'Hello' }])
    const tooLong = await askHelpChat([{ role: 'visitor', text: 'a'.repeat(501) }])

    expect(endsWithAnswer.statusCode).toBe(400)
    expect(tooLong.statusCode).toBe(400)
  })

  it('sends CORS headers to the website’s origin only', async () => {
    server = await buildTestServer()
    const preflight = (origin: string) =>
      server.inject({
        method: 'OPTIONS',
        url: '/v1/help/chat',
        headers: { origin, 'access-control-request-method': 'POST' },
      })

    expect(
      (await preflight(TEST_WAITLIST_ALLOWED_ORIGIN)).headers['access-control-allow-origin'],
    ).toBe(TEST_WAITLIST_ALLOWED_ORIGIN)
    expect(
      (await preflight('https://evil.example')).headers['access-control-allow-origin'],
    ).toBeUndefined()
  })
})
