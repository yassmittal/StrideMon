import type { MetadataRoute } from 'next'
import { siteUrl } from '@/content/site'

export const dynamic = 'force-static'

/**
 * The AI crawlers, named so the choice is on record (D-061): search (quoted with a link), user
 * (fetches a page someone asked about) and training. All are allowed. A named group replaces `*`
 * for that bot, so each must say `Allow: /` itself; to opt one out, give it its own `Disallow`.
 */
const aiCrawlerUserAgents = [
  // OpenAI: ChatGPT search, a ChatGPT user's fetch, training.
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic: Claude's search, a Claude user's fetch, training.
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity: its search index, and a user's fetch.
  'PerplexityBot',
  'Perplexity-User',
  // Google's Gemini (training and grounding) and Apple Intelligence: tokens, not crawlers.
  'Google-Extended',
  'Applebot-Extended',
  // Common Crawl, which many models are trained on.
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: aiCrawlerUserAgents, allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
