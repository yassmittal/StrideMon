import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import { showroomDescription, showroomTitle, showroomUrl } from '@/content/showroom'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { fontshareCssUrl, loadFontshareCss } from '@/lib/load-fontshare-css'
import './globals.css'

// Fonts load as the website loads them: IBM Plex Mono through next/font (500 too, for the store's
// signs), Satoshi from Fontshare's CSS, fetched at build time and inlined.
const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(showroomUrl),
  ...buildPageMetadata({ title: showroomTitle, description: showroomDescription, path: '/' }),
}

export const viewport: Viewport = {
  themeColor: '#05060A',
  colorScheme: 'dark',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const fontshareCss = await loadFontshareCss()
  for (const woff2Url of fontshareCss?.woff2Urls ?? []) {
    preload(woff2Url, { as: 'font', type: 'font/woff2', crossOrigin: '' })
  }
  return (
    <html lang="en" className={plexMono.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        {fontshareCss ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Fontshare's @font-face rules, fetched at build time.
          <style dangerouslySetInnerHTML={{ __html: fontshareCss.css }} />
        ) : (
          <link rel="stylesheet" href={fontshareCssUrl} />
        )}
      </head>
      <body>
        {children}
        {/* Page views, free on Vercel, as the website (brief §7.7). */}
        <Analytics />
      </body>
    </html>
  )
}
