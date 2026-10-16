/**
 * X's composer with a post written out (D-036). It opens in a new tab, and the visitor edits and
 * sends it: the site never posts for anyone.
 */
export function buildXPostUrl(text: string, linkUrl: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(linkUrl)}`
}
