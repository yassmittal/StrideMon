import { HELP_TOPICS_LINE_PREFIX } from './build-help-chat-prompt'
import { HELP_TOPIC_IDS, type HelpTopicId } from './help-knowledge'

const MAX_LINKED_HELP_TOPIC_COUNT = 2

// Markdown the widget shows as plain text: bold and italics markers, and heading hashes.
const MARKDOWN_EMPHASIS_PATTERN = /\*\*|__|^#+\s*/gm

const HELP_TOPIC_ID_SET: ReadonlySet<string> = new Set(HELP_TOPIC_IDS)

export type HelpChatReply = {
  answerText: string
  /** At most two, each an anchor on /help. Ids the help page doesn't have are dropped. */
  helpTopicIds: HelpTopicId[]
}

/**
 * Splits the model's reply into the answer and its help topics (the `TOPICS:` line, D-048).
 * `null` when there's no answer left to show.
 */
export function parseHelpChatReply(modelText: string): HelpChatReply | null {
  const lines = modelText.trim().split('\n')
  const topicsLineIndex = findTopicsLineIndex(lines)
  const topicsLine = topicsLineIndex === -1 ? '' : (lines[topicsLineIndex] ?? '')
  const answerLines = topicsLineIndex === -1 ? lines : lines.slice(0, topicsLineIndex)
  const answerText = answerLines.join('\n').replace(MARKDOWN_EMPHASIS_PATTERN, '').trim()
  if (answerText === '') return null
  return { answerText, helpTopicIds: readHelpTopicIds(topicsLine) }
}

/** The last line that starts with `TOPICS:`, or -1. */
function findTopicsLineIndex(lines: readonly string[]): number {
  for (let lineIndex = lines.length - 1; lineIndex >= 0; lineIndex--) {
    if (lines[lineIndex]?.trim().toUpperCase().startsWith(HELP_TOPICS_LINE_PREFIX)) return lineIndex
  }
  return -1
}

function readHelpTopicIds(topicsLine: string): HelpTopicId[] {
  const topicIds = topicsLine
    .trim()
    .slice(HELP_TOPICS_LINE_PREFIX.length)
    .split(/[\s,]+/)
    .map((topicId) => topicId.trim().toLowerCase().replace(/^#/, ''))
    .filter((topicId): topicId is HelpTopicId => HELP_TOPIC_ID_SET.has(topicId))
  return [...new Set(topicIds)].slice(0, MAX_LINKED_HELP_TOPIC_COUNT)
}
