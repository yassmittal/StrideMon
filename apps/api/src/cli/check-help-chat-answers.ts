// Asks the live model every question in Part 8's test list and checks each answer (D-048).
//
//   bun run help:check-answers                     the API's model (HELP_CHAT_MODEL)
//   bun run help:check-answers --model deepseek.v3.2   another Bedrock model, to compare
//
// Needs BEDROCK_API_KEY (apps/api/.env). Costs a fraction of a cent per run. Exits 1 if any
// answer fails, and prints every answer so a person can read them too.

import { parseArgs } from 'node:util'
import { requestHelpChatReply } from '../handlers/help-chat/request-help-chat-reply'
import { calculateHelpChatCostUsd, HELP_CHAT_MODEL } from '../lib/help-chat/help-chat-cost'
import { createBedrockHelpChatModel } from '../services/help-chat-model'
import {
  FORBIDDEN_IN_EVERY_ANSWER,
  HELP_CHAT_TEST_LIST,
  type HelpChatTestCase,
} from './help-chat-test-list'

const { values: options } = parseArgs({
  options: { model: { type: 'string', default: HELP_CHAT_MODEL.modelId } },
})

const bedrockApiKey = process.env.BEDROCK_API_KEY
if (bedrockApiKey === undefined || bedrockApiKey === '') {
  console.error('Set BEDROCK_API_KEY in apps/api/.env first.')
  process.exit(1)
}

const helpChatModel = createBedrockHelpChatModel({ bedrockApiKey, modelId: options.model })
let failedCount = 0
let inputTokenCount = 0
let outputTokenCount = 0

console.log(`Model: ${options.model}\n`)
for (const [testIndex, testCase] of HELP_CHAT_TEST_LIST.entries()) {
  const startedAtMilliseconds = performance.now()
  const outcome = await requestHelpChatReply({
    conversation: [{ role: 'visitor', text: testCase.question }],
    helpChatModel,
  }).catch((error: unknown) => {
    failedCount += 1
    console.log(`FAIL ${testIndex + 1}. ${testCase.question}\n  ✗ ${String(error)}\n`)
    return null
  })
  if (outcome === null) continue
  const elapsedSeconds = (performance.now() - startedAtMilliseconds) / 1000
  inputTokenCount += outcome.tokenCounts?.inputTokenCount ?? 0
  outputTokenCount += outcome.tokenCounts?.outputTokenCount ?? 0

  const problems = listAnswerProblems(testCase, outcome.reply)
  if (problems.length > 0) failedCount += 1
  console.log(
    `${problems.length === 0 ? 'PASS' : 'FAIL'} ${testIndex + 1}. ${testCase.question} (${elapsedSeconds.toFixed(1)} s)`,
  )
  console.log(`  ${outcome.reply.answerText.replaceAll('\n', '\n  ')}`)
  console.log(`  topics: ${outcome.reply.helpTopicIds.join(', ') || 'none'}`)
  console.log(`  expected: ${testCase.expectedAnswer}`)
  for (const problem of problems) console.log(`  ✗ ${problem}`)
  console.log('')
}

const costUsd = calculateHelpChatCostUsd({ inputTokenCount, outputTokenCount })
console.log(
  `${HELP_CHAT_TEST_LIST.length - failedCount}/${HELP_CHAT_TEST_LIST.length} passed. ${inputTokenCount} input and ${outputTokenCount} output tokens, about $${costUsd.toFixed(4)} at ${HELP_CHAT_MODEL.modelId}'s price.`,
)
process.exit(failedCount === 0 ? 0 : 1)

function listAnswerProblems(
  testCase: HelpChatTestCase,
  reply: { answerText: string; helpTopicIds: readonly string[] },
): string[] {
  const missingPatterns = testCase.requiredPatterns.filter(
    (pattern) => !pattern.test(reply.answerText),
  )
  const forbiddenPatterns = [...FORBIDDEN_IN_EVERY_ANSWER, ...(testCase.forbiddenPatterns ?? [])]
  const foundPatterns = forbiddenPatterns.filter((pattern) => pattern.test(reply.answerText))
  const isTopicMissing =
    testCase.expectedTopicIds.length > 0 &&
    !testCase.expectedTopicIds.some((topicId) => reply.helpTopicIds.includes(topicId))
  return [
    ...missingPatterns.map((pattern) => `missing ${pattern}`),
    ...foundPatterns.map((pattern) => `must not say ${pattern}`),
    ...(isTopicMissing ? [`links none of: ${testCase.expectedTopicIds.join(', ')}`] : []),
  ]
}
