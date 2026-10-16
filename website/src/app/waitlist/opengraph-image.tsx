import { ImageResponse } from 'next/og'
import { siteUrl, waitlistPagePath } from '@/content/site'
import { waitlistJoinedContent, waitlistPageContent } from '@/content/waitlist'
import { PASS_CARD_SHOE_WINDOW } from '@/lib/founding-pass/pass-design'
import { readPassShoeArtDataUri } from '@/lib/founding-pass/read-pass-share-art'
import { loadSatoshiFontData } from '@/lib/load-satoshi-font-data'

export const dynamic = 'force-static'
export const alt = waitlistPageContent.shareImageAlt
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TICKET_WIDTH = 500
const TICKET_PADDING = 36
const HAIRLINE_WIDTH = 2
const SHOE_GAP = 12
const SHOE_WIDTH = Math.floor((TICKET_WIDTH - 2 * (TICKET_PADDING + HAIRLINE_WIDTH) - SHOE_GAP) / 2)
const SHOE_HEIGHT = Math.round(
  (SHOE_WIDTH * PASS_CARD_SHOE_WINDOW.height) / PASS_CARD_SHOE_WINDOW.width,
)
const HAIRLINE = `${HAIRLINE_WIDTH}px solid rgba(0, 0, 0, 0.1)`
// Satoshi has no ✓ glyph, so the check and the "+" marks are drawn.
const crossMarkDataUri = buildSvgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><path d="M7 0v14M0 7h14" stroke="#999999" stroke-width="1.5" fill="none"/></svg>',
)
const checkDataUri = buildSvgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><path d="M2 6.5 4.75 9 10 3" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
)
const crossMarkCorners = [
  { top: 12, left: 12 },
  { top: 12, right: 12 },
  { bottom: 12, left: 12 },
  { bottom: 12, right: 12 },
] as const

// The card X shows under a shared post (D-055): the invitation on the left, and the joined
// card's ticket on the right, as the visitor saw it on the page.
export default async function WaitlistOpenGraphImage() {
  const fonts = await loadSatoshiFontData()
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F1FA',
        padding: 56,
        gap: 48,
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
          {waitlistPageContent.shareImageMetaLabels.join(' • ').toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 124,
              lineHeight: 0.9,
              letterSpacing: -2.5,
            }}
          >
            {waitlistPageContent.shareImageHeadlineWords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
          <div style={{ display: 'flex', fontSize: 34, lineHeight: 1.2 }}>
            {waitlistPageContent.shareImageSubline}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26 }}>
          {`${new URL(siteUrl).host}${waitlistPagePath}`}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          width: TICKET_WIDTH,
          padding: TICKET_PADDING,
          border: HAIRLINE,
          borderRadius: 10,
        }}
      >
        {crossMarkCorners.map((corner) => (
          // biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image.
          <img
            key={JSON.stringify(corner)}
            src={crossMarkDataUri}
            width={14}
            height={14}
            alt=""
            style={{ position: 'absolute', ...corner }}
          />
        ))}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: 14,
            borderBottom: HAIRLINE,
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 1.6,
          }}
        >
          <span>{waitlistJoinedContent.ticketLabel.toUpperCase()}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* biome-ignore lint/performance/noImgElement: next/og renders plain <img>, not next/image. */}
            <img src={checkDataUri} width={16} height={16} alt="" />
            {waitlistJoinedContent.ticketStatus.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SHOE_GAP }}>
          {waitlistPageContent.showcaseDesignNumbers.map((designNumber) => (
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
        <div style={{ display: 'flex', paddingTop: 18, borderTop: HAIRLINE }}>
          {waitlistPageContent.shareImageFacts.map((fact) => (
            <div
              key={fact.label}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 6 }}
            >
              <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: 1.4, opacity: 0.6 }}>
                {fact.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 30 }}>{fact.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
}

function buildSvgDataUri(svgText: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svgText).toString('base64')}`
}
