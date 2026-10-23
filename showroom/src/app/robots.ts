import type { MetadataRoute } from 'next'
import { showroomUrl } from '@/content/showroom'

export const dynamic = 'force-static'

/**
 * The website's crawler list, copied by hand (D-061): search, user and training crawlers, all
 * allowed. A named group replaces `*` for that bot, so each must say `Allow: /` itself.
 */
const aiCrawlerUserAgents = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: aiCrawlerUserAgents, allow: '/' },
    ],
    sitemap: `${showroomUrl}/sitemap.xml`,
  }
}
