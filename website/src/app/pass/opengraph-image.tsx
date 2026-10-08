import { ImageResponse } from 'next/og'
import { foundingPassSectionContent, passPageContent } from '@/content/founding-pass'
import { PASS_CARD_SHOE_WINDOW } from '@/lib/founding-pass/pass-design'
import { readPassShoeArtDataUri } from '@/lib/founding-pass/read-pass-share-art'
import { loadSatoshiFontData } from '@/lib/load-satoshi-font-data'

export const dynamic = 'force-static'
export const alt = passPageContent.title
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SHOE_WIDTH = 264
const SHOE_HEIGHT = Math.round(
  (SHOE_WIDTH * PASS_CARD_SHOE_WINDOW.height) / PASS_CARD_SHOE_WINDOW.width,
)

// The gallery's share image: the headline and four of the 1,000.
export default async function PassGalleryOpenGraphImage() {
  const fonts = await loadSatoshiFontData()
  const showcaseDesignNumbers = foundingPassSectionContent.showcaseDesignNumbers.slice(0, 4)
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F1FA',
        padding: 56,
        fontFamily: 'Satoshi',
        color: '#000000',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 1.6,
              opacity: 0.6,
            }}
          >
            {passPageContent.metaLabels.join(' • ').toUpperCase()}
          </div>
          <div style={{ display: 'flex', fontSize: 96, lineHeight: 0.9, letterSpacing: -2 }}>
            {passPageContent.headlineWords.join(' ')}
          </div>
          <div style={{ display: 'flex', fontSize: 34 }}>{foundingPassSectionContent.heading}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 26 }}>stridemon.xyz/pass</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        {showcaseDesignNumbers.map((designNumber) => (
          // biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image.
          <img
            key={designNumber}
            src={readPassShoeArtDataUri(designNumber)}
            width={SHOE_WIDTH}
            height={SHOE_HEIGHT}
            alt=""
          />
        ))}
      </div>
    </div>,
    { ...size, fonts },
  )
}
