// Every word in the Pass chat film, mirrored from FACTS.md §14. Nothing goes on screen from
// anywhere else. No STRIDE amount, price, worth, value, floor, "mint", date, "limited", emoji,
// "iMessage" or Apple anything (docs/pass-chat-video-prompt.md §2).

export type ChatSide = 'sent' | 'received'

/** One bubble: its words, with the one word set in the lime script. */
export type ChatMessage = {
  side: ChatSide
  before: string
  scriptWord: string
  after: string
}

/**
 * The chat (Script C, approved): two friends picking a pass in the gallery. Lower-case and texty
 * on purpose: it's them talking, not StrideMon's voice.
 */
export const chatMessages: readonly ChatMessage[] = [
  { side: 'sent', before: 'did u see the ', scriptWord: 'Founding Passes', after: '?' },
  { side: 'received', before: 'the free ones on ', scriptWord: 'Monad', after: '?' },
  // Non-breaking spaces keep “1 of 1” on one line.
  {
    side: 'received',
    before: 'yeah, ',
    scriptWord: '1,000',
    after: ' designs. all\u00a01\u00a0of\u00a01',
  },
  { side: 'sent', before: 'i’m taking ', scriptWord: '#0627', after: '' },
]

export const chatChrome = {
  /** A made-up morning-walk hour, with no date. */
  timestamp: 'Today 7:30 AM',
  composePlaceholder: 'Message',
} as const

/** The card's label: design #0627's number and name, as the design table has them. */
export const heroLabel = { number: '#0627', name: 'Lime Runner Day' } as const

/** The twist line: Satoshi, the script word, Satoshi. */
export const twistLine = { before: 'This', scriptWord: 'isn’t', after: 'a JPEG.' } as const

export const passChatEndContent = {
  line: 'It’s your way into StrideMon.',
  siteLabel: 'stridemon.xyz/pass',
} as const
