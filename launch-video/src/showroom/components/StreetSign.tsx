import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { colors, fontFamilies } from '../../theme'
import { showroomShots } from '../timeline'

// The last shot, as the reference's "Samsung Authorized Showroom ←" sign: a street sign in focus on
// its pole, a railing across the bottom, and the store behind it out of focus (the 3D canvas,
// blurred). Sizes are shares of the reference's frame (reference.md).

const SIGN_PLATE_COLOR = '#2A3038'
const SIGN_TEXT_COLOR = '#EDEFF2'
const POLE_COLOR = '#3B3E44'
const RAILING_COLOR = '#0D0E10'

function ArrowLeft() {
  return (
    <svg width={300} height={70} viewBox="0 0 300 70" aria-hidden="true">
      <path d="M290 35H40" stroke={SIGN_TEXT_COLOR} strokeWidth={12} strokeLinecap="round" />
      <path d="M70 8 34 35l36 27" fill="none" stroke={SIGN_TEXT_COLOR} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StreetSign() {
  const frame = useCurrentFrame()
  const { startFrame, endFrame } = showroomShots.streetSign
  // A slow push, as the reference's last shot.
  const scale = interpolate(frame, [startFrame, endFrame], [1, 1.03])
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      {/* The pole, from above the frame down behind the sign. */}
      <div style={{ position: 'absolute', left: 520, top: 0, width: 26, height: 1500, background: `linear-gradient(90deg, #2A2C30, ${POLE_COLOR} 40%, #55585E 60%, #2A2C30)` }} />
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 860,
          width: 740,
          height: 470,
          padding: '0 48px',
          boxSizing: 'border-box',
          backgroundColor: SIGN_PLATE_COLOR,
          border: '6px solid #1B1F25',
          borderRadius: 10,
          transform: 'perspective(1600px) rotateY(-8deg) rotateZ(-1.2deg)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: SIGN_TEXT_COLOR,
        }}
      >
        <div style={{ fontFamily: fontFamilies.satoshi, fontWeight: 700, fontSize: 96, letterSpacing: 4, lineHeight: 1, whiteSpace: 'nowrap' }}>
          STRIDEMON
        </div>
        <div style={{ fontFamily: fontFamilies.mono, fontWeight: 500, fontSize: 44, letterSpacing: 5, marginTop: 18, color: colors.highlight, whiteSpace: 'nowrap' }}>
          FOUNDING PASS
        </div>
        <div style={{ marginTop: 28 }}>
          <ArrowLeft />
        </div>
        <div style={{ fontFamily: fontFamilies.mono, fontWeight: 500, fontSize: 34, letterSpacing: 2, marginTop: 16, opacity: 0.85 }}>
          stridemon.xyz/pass
        </div>
      </div>
      {/* The railing across the bottom. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, height: 14, backgroundColor: RAILING_COLOR }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1840, height: 14, backgroundColor: RAILING_COLOR }} />
      {Array.from({ length: 14 }, (_, barIndex) => (
        <div
          key={barIndex}
          style={{ position: 'absolute', left: 30 + barIndex * 80, top: 1500, width: 12, height: 420, backgroundColor: RAILING_COLOR }}
        />
      ))}
    </AbsoluteFill>
  )
}
