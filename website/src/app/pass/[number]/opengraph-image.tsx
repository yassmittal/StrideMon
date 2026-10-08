import { ImageResponse } from 'next/og'
import { passPromiseLine } from '@/content/founding-pass'
import {
  formatPassNumber,
  PASS_CARD_SHOE_WINDOW,
  passDesigns,
  passRarityLabels,
  readPassDesign,
} from '@/lib/founding-pass/pass-design'
import { readPassShoeArtDataUri } from '@/lib/founding-pass/read-pass-share-art'
import { loadSatoshiFontData } from '@/lib/load-satoshi-font-data'

export const alt = 'A StrideMon Founding Pass'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamicParams = false

export function generateStaticParams(): { number: string }[] {
  return passDesigns.map((design) => ({ number: String(design.designNumber) }))
}

const SHOE_WIDTH = 660
const SHOE_HEIGHT = Math.round(
  (SHOE_WIDTH * PASS_CARD_SHOE_WINDOW.height) / PASS_CARD_SHOE_WINDOW.width,
)

// The pass's share image (brief §8): the shoe from its on-chain card, its number and name.
export default async function PassOpenGraphImage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const design = readPassDesign(Number((await params).number))
  if (design === undefined) throw new Error('No such pass')
  const fonts = await loadSatoshiFontData()
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F1FA',
        padding: 56,
        gap: 24,
        fontFamily: 'Satoshi',
        color: '#000000',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: SHOE_WIDTH }}>
        {/* biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image. */}
        <img
          src={readPassShoeArtDataUri(design.designNumber)}
          width={SHOE_WIDTH}
          height={SHOE_HEIGHT}
          alt=""
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 1.6,
              opacity: 0.6,
            }}
          >
            {`FOUNDING PASS • ${formatPassNumber(design.designNumber)}`}
          </div>
          <div style={{ display: 'flex', fontSize: 64, lineHeight: 0.95, letterSpacing: -1 }}>
            {design.name}
          </div>
          <div style={{ display: 'flex', fontSize: 20, fontWeight: 500, letterSpacing: 1.6 }}>
            {`${passRarityLabels[design.rarity].toUpperCase()} • ONE OF ONE`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', fontSize: 20, lineHeight: 1.3, opacity: 0.6 }}>
            {passPromiseLine}
          </div>
          <div style={{ display: 'flex', fontSize: 26 }}>stridemon.xyz/pass</div>
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
}
