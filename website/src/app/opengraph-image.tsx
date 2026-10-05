import { ImageResponse } from 'next/og'
import { heroContent } from '@/content/hero'
import { siteTitle } from '@/content/site'
import { loadSatoshiFontData } from '@/lib/load-satoshi-font-data'
import { readPublicTextFile } from '@/lib/read-public-file'
import { sneakerArtPath } from '@/lib/read-sneaker-art'

export const dynamic = 'force-static'
export const alt = siteTitle
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The off-white page, the headline, and the dark Sneaker panel. Twitter uses it too.
export default async function OpenGraphImage() {
  const fonts = await loadSatoshiFontData()
  const sneakerArtDataUri = `data:image/svg+xml;base64,${Buffer.from(readPublicTextFile(sneakerArtPath)).toString('base64')}`
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F1FA',
        padding: 60,
        gap: 60,
        fontFamily: 'Satoshi',
        color: '#000000',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 1.6,
            opacity: 0.6,
          }}
        >
          {heroContent.metaLabels.join(' • ').toUpperCase()}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 132,
            lineHeight: 0.9,
            letterSpacing: -2.6,
          }}
        >
          {heroContent.headlineWords.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 510,
          height: 510,
          borderRadius: 10,
          backgroundColor: '#141515',
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image. */}
        <img src={sneakerArtDataUri} width={510} height={510} alt="" />
      </div>
    </div>,
    { ...size, fonts },
  )
}
