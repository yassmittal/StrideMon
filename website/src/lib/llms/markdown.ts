import { siteUrl } from '@/content/site'

// Small Markdown writers for `/llms.txt` and the pages' Markdown copies (D-061). Every link is
// absolute, because these files are read away from the site.

/** A site path, an in-page `#id` (resolved against `pagePath`) or a full URL, made absolute. */
export function buildAbsoluteUrl(href: string, pagePath = '/'): string {
  if (href.startsWith('#')) return `${siteUrl}${pagePath === '/' ? '/' : pagePath}${href}`
  if (href.startsWith('/')) return `${siteUrl}${href}`
  return href
}

export function renderMarkdownLink(label: string, href: string, pagePath?: string): string {
  return `[${label}](${buildAbsoluteUrl(href, pagePath)})`
}

export function renderBulletList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

export function renderNumberedList(items: readonly string[]): string {
  return items.map((item, itemIndex) => `${itemIndex + 1}. ${item}`).join('\n')
}

function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|')
}

export function renderTable(
  headerCells: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const renderRow = (cells: readonly string[]) => `| ${cells.map(escapeTableCell).join(' | ')} |`
  return [
    renderRow(headerCells),
    `| ${headerCells.map(() => '---').join(' | ')} |`,
    ...rows.map(renderRow),
  ].join('\n')
}

/** Joins blocks with one blank line, skipping empty ones, and ends the file with a newline. */
export function joinMarkdownBlocks(blocks: readonly (string | null | undefined)[]): string {
  return `${blocks.filter((block) => block !== null && block !== undefined && block !== '').join('\n\n')}\n`
}

/** "Saturday 28 November 2026 at 14:30 UTC (20:00 IST)": the schedule, readable anywhere. */
export function formatScheduleTime(isoTime: string): string {
  const time = new Date(isoTime)
  const utcText = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(time)
  const indiaText = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(time)
  return `${utcText} UTC (${indiaText} IST)`
}

/** The response every Markdown route sends. A static export keeps only the body: `vercel.json` sets the headers. */
export function buildTextResponse(text: string, contentType: 'text/plain' | 'text/markdown') {
  return new Response(text, { headers: { 'Content-Type': `${contentType}; charset=utf-8` } })
}
