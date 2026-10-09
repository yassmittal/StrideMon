import { english as recoveryPhraseWords } from 'viem/accounts'
import type { HelpTopicId } from './help-knowledge'

// The shortest Secret Recovery Phrase (BIP-39): 12 words.
const MINIMUM_RECOVERY_PHRASE_WORD_COUNT = 12

// 32 bytes of hex: a private key, or a transaction hash (which explorers show with 0x). A wallet
// address is only 20 bytes, so it's never touched.
const THIRTY_TWO_BYTE_HEX_PATTERN = /(?<![0-9a-z])(0x)?[0-9a-f]{64}(?![0-9a-z])/gi

const RECOVERY_PHRASE_WORD_SET: ReadonlySet<string> = new Set(recoveryPhraseWords)

/** What replaces a possible secret before a message reaches the model (D-048). */
export const REMOVED_WALLET_SECRET_TEXT = '[removed]'

/** The answer to a message that holds a wallet secret. The model never sees that message. */
export const WALLET_SECRET_REPLY = {
  answerText:
    'Please keep that secret. Never share your Secret Recovery Phrase or private key, here or anywhere. StrideMon never needs it, and anyone who asks for it is trying to steal from you. If someone else has seen it, make a new wallet and write to us: support can move your pass to it.',
  helpTopicIds: ['install-metamask', 'lost-wallet'],
} as const satisfies { answerText: string; helpTopicIds: readonly HelpTopicId[] }

/**
 * Whether the text holds something that unlocks a wallet: 12 or more recovery phrase words in a
 * row, or 32 bytes of hex without 0x (how MetaMask shows a private key). Such a message gets
 * `WALLET_SECRET_REPLY` and never reaches the model (D-048).
 */
export function containsWalletSecret(text: string): boolean {
  if (hasRecoveryPhraseRun(text)) return true
  return [...text.matchAll(THIRTY_TWO_BYTE_HEX_PATTERN)].some((match) => match[1] === undefined)
}

/**
 * The text as the model may see it: a recovery phrase empties the whole message, and any 32 bytes
 * of hex (a key, or a transaction hash with 0x) is removed. The model never needs either.
 */
export function removeWalletSecrets(text: string): string {
  if (hasRecoveryPhraseRun(text)) return REMOVED_WALLET_SECRET_TEXT
  return text.replace(THIRTY_TWO_BYTE_HEX_PATTERN, REMOVED_WALLET_SECRET_TEXT)
}

function hasRecoveryPhraseRun(text: string): boolean {
  let wordsInRowCount = 0
  for (const word of text.toLowerCase().split(/[^a-z]+/)) {
    if (word === '') continue
    wordsInRowCount = RECOVERY_PHRASE_WORD_SET.has(word) ? wordsInRowCount + 1 : 0
    if (wordsInRowCount >= MINIMUM_RECOVERY_PHRASE_WORD_COUNT) return true
  }
  return false
}
