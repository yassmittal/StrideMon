import { buildPassMarkdown } from '@/lib/llms/build-page-markdown'
import { buildTextResponse } from '@/lib/llms/markdown'

// The Founding Pass page as Markdown (D-061), written once at `next build`.
export const dynamic = 'force-static'

export function GET(): Response {
  return buildTextResponse(buildPassMarkdown(), 'text/markdown')
}
