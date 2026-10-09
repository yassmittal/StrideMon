import { describe, expect, it } from 'bun:test'
import { calculateHelpChatCostUsd, toHelpChatUsageMonth } from './help-chat-cost'
import { parseHelpChatReply } from './parse-help-chat-reply'
import { containsWalletSecret, removeWalletSecrets } from './wallet-secret'

const RECOVERY_PHRASE =
  'abandon ability able about above absent absorb abstract absurd abuse access accident'
const PRIVATE_KEY_HEX = 'ab'.repeat(32)

describe('wallet secrets', () => {
  it('finds a recovery phrase, numbered or not, and a private key without 0x', () => {
    expect(containsWalletSecret(`here it is: ${RECOVERY_PHRASE}`)).toBe(true)
    expect(
      containsWalletSecret(
        RECOVERY_PHRASE.split(' ')
          .map((word, wordIndex) => `${wordIndex + 1}. ${word}`)
          .join('\n'),
      ),
    ).toBe(true)
    expect(containsWalletSecret(`key ${PRIVATE_KEY_HEX}`)).toBe(true)
  })

  it('leaves ordinary questions, addresses and transaction hashes alone', () => {
    expect(
      containsWalletSecret(
        'I already minted my pass but the app says I have no pass, what should I do about it?',
      ),
    ).toBe(false)
    expect(containsWalletSecret(`my wallet is 0x${'cd'.repeat(20)}`)).toBe(false)
    expect(containsWalletSecret(`my mint 0x${PRIVATE_KEY_HEX} is slow`)).toBe(false)
    // Eleven words is shorter than any recovery phrase.
    expect(containsWalletSecret(RECOVERY_PHRASE.split(' ').slice(0, 11).join(' '))).toBe(false)
  })

  it('removes every 32-byte hex, and a whole message with a recovery phrase', () => {
    expect(removeWalletSecrets(`mint 0x${PRIVATE_KEY_HEX} is slow`)).toBe('mint [removed] is slow')
    expect(removeWalletSecrets(`please check ${RECOVERY_PHRASE}`)).toBe('[removed]')
    expect(removeWalletSecrets(`wallet 0x${'cd'.repeat(20)}`)).toBe(`wallet 0x${'cd'.repeat(20)}`)
  })
})

describe('parseHelpChatReply', () => {
  it('splits the answer from its topics, keeping only real ones, at most two', () => {
    expect(
      parseHelpChatReply(
        '**Look** in spam.\nTOPICS: #code-not-arriving, invented-topic, wrong-code, robot-check',
      ),
    ).toEqual({ answerText: 'Look in spam.', helpTopicIds: ['code-not-arriving', 'wrong-code'] })
  })

  it('answers with no topics when the line is missing or says none', () => {
    expect(parseHelpChatReply('I can only help with StrideMon.')?.helpTopicIds).toEqual([])
    expect(parseHelpChatReply('Sorry.\nTopics: none')?.helpTopicIds).toEqual([])
  })

  it('gives null when only the topics line came back', () => {
    expect(parseHelpChatReply('TOPICS: wrong-code')).toBeNull()
    expect(parseHelpChatReply('   ')).toBeNull()
  })
})

describe('the help chat cost', () => {
  it('prices tokens at the model’s list price', () => {
    expect(
      calculateHelpChatCostUsd({ inputTokenCount: 1_000_000, outputTokenCount: 1_000_000 }),
    ).toBeCloseTo(2.47)
  })

  it('counts each month in UTC', () => {
    expect(toHelpChatUsageMonth(new Date('2026-10-31T23:30:00-05:00'))).toBe('2026-11')
  })
})
