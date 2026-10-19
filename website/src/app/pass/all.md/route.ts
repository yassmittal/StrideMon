import { buildPassIndexMarkdown } from '@/lib/llms/build-page-markdown'
import { buildTextResponse } from '@/lib/llms/markdown'

// Every pass with its layers, as Markdown (D-061), written once at `next build`.
export const dynamic = 'force-static'

export function GET(): Response {
  return buildTextResponse(buildPassIndexMarkdown(), 'text/markdown')
}
