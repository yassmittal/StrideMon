import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { preload } from 'react-dom'
import {
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
  xAccountHandle,
  xCreatorHandle,
} from '@/content/site'
import { fontshareCssUrl, loadFontshareCss } from '@/lib/load-fontshare-css'
import './globals.css'

const plexMono = IBM_Plex_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName,
    locale: 'en_US',
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    site: xAccountHandle,
    creator: xCreatorHandle,
    title: siteTitle,
    description: siteDescription,
  },
}

export const viewport: Viewport = {
  themeColor: '#F0F1FA',
  colorScheme: 'light',
}

// Arms the scroll reveal before first paint, only when motion is allowed, so content never
// flashes and is simply there without JavaScript. If the observer never loads, it disarms.
const revealArmingScript = `(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('reveal-ready');
  setTimeout(() => { if (!window.__strideMonRevealReady) root.classList.remove('reveal-ready'); }, 3000);
})();`

export default async function RootLayout({ children }: { children: ReactNode }) {
  const fontshareCss = await loadFontshareCss()
  for (const woff2Url of fontshareCss?.woff2Urls ?? []) {
    preload(woff2Url, { as: 'font', type: 'font/woff2', crossOrigin: '' })
  }
  return (
    <html lang="en" className={plexMono.variable} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed inline script we wrote, needed before paint. */}
        <script dangerouslySetInnerHTML={{ __html: revealArmingScript }} />
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
        <Analytics />
      </body>
    </html>
  )
}
