// Tells the IndexNow search engines (Bing, Yandex, Seznam, Naver) about the site's pages (D-061),
// so a change shows up in Bing, and so in Copilot and ChatGPT search, without waiting for a crawl.
//
//   bun run indexnow             sends every URL in out/sitemap.xml
//   bun run indexnow --dry-run   lists them and sends nothing
//
// Run it after a deploy, from `website/`, once `bun run build` has written `out/`. The key file
// (`public/<indexNowKey>.txt`) must already be live, or the engines refuse the list.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { indexNowKey, siteUrl } from '../src/content/site'

const indexNowEndpoint = 'https://api.indexnow.org/indexnow'
const websiteRoot = fileURLToPath(new URL('..', import.meta.url))
const isDryRun = process.argv.includes('--dry-run')

function readSitemapUrls(): string[] {
  const sitemapPath = join(websiteRoot, 'out/sitemap.xml')
  let sitemapXml: string
  try {
    sitemapXml = readFileSync(sitemapPath, 'utf8')
  } catch {
    throw new Error(`No ${sitemapPath}. Run bun run build first.`)
  }
  return [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap((match) =>
    match[1] === undefined ? [] : [match[1]],
  )
}

function checkKeyFile(): void {
  const keyFileText = readFileSync(join(websiteRoot, `public/${indexNowKey}.txt`), 'utf8').trim()
  if (keyFileText !== indexNowKey) {
    throw new Error(`public/${indexNowKey}.txt must hold exactly the key in src/content/site.ts.`)
  }
}

checkKeyFile()
const urlList = readSitemapUrls()
const host = new URL(siteUrl).host

if (isDryRun) {
  console.log(urlList.join('\n'))
  console.log(`\n${urlList.length} URLs for ${host}. Dry run: nothing sent.`)
} else {
  const response = await fetch(indexNowEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: indexNowKey,
      keyLocation: `${siteUrl}/${indexNowKey}.txt`,
      urlList,
    }),
  })
  // 200 and 202 both mean received. A first submission answers 403 SiteVerificationNotCompleted
  // while the engine fetches the key file in the background: run it again later.
  if (!response.ok) {
    const responseText = await response.text()
    if (responseText.includes('SiteVerificationNotCompleted')) {
      console.error('IndexNow is still checking the key file. Run this again in an hour or so.')
      process.exit(1)
    }
    throw new Error(`IndexNow answered ${response.status}: ${responseText}`)
  }
  console.log(`IndexNow received ${urlList.length} URLs for ${host} (${response.status}).`)
}
