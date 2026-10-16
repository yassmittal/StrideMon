import { Audio } from '@remotion/media'
import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, Sequence, staticFile } from 'remotion'
import { ArrowIcon } from '../components/ArrowIcon'
import { toSneakerArtFileName } from '../components/SneakerArt'
import { SvgArt, useSvgMarkups } from '../components/svg-markup'
import {
  colors,
  floatingPillShadow,
  fontFamilies,
  fontWeights,
  radii,
  readSectionBackground,
  readSectionText,
  type SectionTone,
} from '../theme'
import { toPassCardPath } from '../waitlist/pass-art'
import {
  Captions,
  Enter,
  ListRow,
  MetaLabel,
  type PhoneSegment,
  PitchPhone,
  pitchLayout,
} from './components'
import type { PitchSceneId } from './script'
import {
  PITCH_DURATION_IN_FRAMES,
  PITCH_FRAMES_PER_SECOND,
  readSceneLines,
  sceneRanges,
  type TimedLine,
  timedLines,
} from './timeline'

// The Metropolis pitch video (16:9, ≤ 2 minutes): the voice over real phone footage, one scene
// per part of the script, captions burned in. Hard cuts between scenes, black and off-white flips.

const MUSIC_VOLUME = 0.09
const MUSIC_FADE_SECONDS = 2
const SNEAKER_ART_PATH = staticFile(
  `sneaker/${toSneakerArtFileName({ level: 2, durability: 100 })}`,
)
const PASS_GRID_DESIGN_NUMBERS = [137, 20, 212, 721, 338, 830] as const
const PASS_GRID_COLUMN_COUNT = 3

type SceneProps = { lines: readonly TimedLine[]; durationInFrames: number }

const sceneTones: Record<PitchSceneId, SectionTone> = {
  hook: 'light',
  problem: 'dark',
  solution: 'light',
  monad: 'dark',
  why: 'light',
  next: 'dark',
  end: 'light',
}

const sceneComponents: Record<PitchSceneId, (props: SceneProps) => ReactNode> = {
  hook: HookScene,
  problem: ProblemScene,
  solution: SolutionScene,
  monad: MonadScene,
  why: WhyScene,
  next: NextScene,
  end: EndScene,
}

export function PitchFilm() {
  const durationSeconds = PITCH_DURATION_IN_FRAMES / PITCH_FRAMES_PER_SECOND
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background }}>
      {sceneRanges.map(({ scene, startFrame, durationInFrames }) => {
        const SceneComponent = sceneComponents[scene]
        return (
          <Sequence key={scene} from={startFrame} durationInFrames={durationInFrames} name={scene}>
            <AbsoluteFill style={{ backgroundColor: readSectionBackground(sceneTones[scene]) }}>
              <SceneComponent lines={readSceneLines(scene)} durationInFrames={durationInFrames} />
            </AbsoluteFill>
          </Sequence>
        )
      })}
      <Captions lines={timedLines} />
      <Audio src={staticFile('pitch/voice.wav')} />
      <Audio
        src={staticFile('pitch/music.wav')}
        volume={(frame) => {
          const seconds = frame / PITCH_FRAMES_PER_SECOND
          return (
            MUSIC_VOLUME *
            interpolate(
              seconds,
              [0, MUSIC_FADE_SECONDS, durationSeconds - MUSIC_FADE_SECONDS * 2, durationSeconds],
              [0, 1, 1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          )
        }}
      />
    </AbsoluteFill>
  )
}

function lineStart(lines: readonly TimedLine[], sceneLineIndex: number): number {
  return lines[sceneLineIndex]?.startFrame ?? 0
}

function Headline({
  text,
  tone,
  startFrame,
  fontSize = pitchLayout.headlineFontSize,
  top = pitchLayout.headlineTop,
  width = pitchLayout.textColumnWidth,
}: {
  text: string
  tone: SectionTone
  startFrame: number
  fontSize?: number
  top?: number
  width?: number
}) {
  return (
    <Enter startFrame={startFrame} style={{ left: pitchLayout.gutter, top, width }}>
      <div
        style={{
          fontFamily: fontFamilies.satoshi,
          fontWeight: fontWeights.regular,
          fontSize,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: readSectionText(tone),
        }}
      >
        {text}
      </div>
    </Enter>
  )
}

function Label({
  text,
  tone,
  startFrame = 0,
}: {
  text: string
  tone: SectionTone
  startFrame?: number
}) {
  return (
    <Enter startFrame={startFrame} style={{ left: pitchLayout.gutter, top: pitchLayout.labelTop }}>
      <MetaLabel text={text} tone={tone} />
    </Enter>
  )
}

/** 1. Hook and who I am. The welcome screen, held. */
function HookScene({ lines, durationInFrames }: SceneProps) {
  return (
    <>
      <Label text="StrideMon  •  Monad testnet" tone="light" />
      <Headline
        text="Your daily walk should count for something."
        tone="light"
        startFrame={lineStart(lines, 0)}
        fontSize={96}
      />
      <Enter startFrame={lineStart(lines, 1)} style={{ left: pitchLayout.gutter, top: 560 }}>
        <div style={{ fontFamily: fontFamilies.satoshi, fontSize: 52, color: colors.textPrimary }}>
          Yash Mittal
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: fontFamilies.satoshi,
            fontSize: 34,
            color: colors.textSecondarySmall,
          }}
        >
          Solo builder • Web3 developer
        </div>
      </Enter>
      <Enter startFrame={lineStart(lines, 2)} style={{ left: pitchLayout.gutter, top: 720 }}>
        <MetaLabel text="Built for Monad Metropolis" tone="light" />
      </Enter>
      <PitchPhone
        tone="light"
        segments={[{ fromLine: 0, clips: [[1, 1]] }]}
        sceneLines={lines}
        sceneDurationInFrames={durationInFrames}
      />
    </>
  )
}

/** 2. The problem. Type only, on black. */
function ProblemScene({ lines }: SceneProps) {
  const rows = [
    { label: 'Step counters', text: 'A number, and that’s it.' },
    { label: 'Move-to-earn games', text: 'Buy an NFT and a token first.' },
    { label: 'So', text: 'People who just want to walk are left out.' },
  ]
  return (
    <>
      <Label text="The problem" tone="dark" />
      {rows.map((row, rowIndex) => (
        <Enter
          key={row.label}
          startFrame={lineStart(lines, rowIndex)}
          style={{ left: pitchLayout.gutter, top: 230 + rowIndex * 200, width: 1640 }}
        >
          <MetaLabel text={row.label} tone="dark" />
          <div
            style={{
              marginTop: 12,
              fontFamily: fontFamilies.satoshi,
              fontSize: 76,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: rowIndex === rows.length - 1 ? colors.highlight : colors.textOnDark,
            }}
          >
            {row.text}
          </div>
        </Enter>
      ))}
    </>
  )
}

const SOLUTION_SEGMENTS: readonly PhoneSegment[] = [
  // Minting your Sneaker → Sneaker #3 → Profile with 0.1 MON.
  { fromLine: 0, clips: [[6.3, 13.9]] },
  // The walk (16×), then STOP → Settling on Monad → +10 STRIDE.
  {
    fromLine: 3,
    clips: [
      [14.2, 18.4],
      [25.6, 33.4],
    ],
  },
  // Repair: review → MetaMask → Sneaker repaired.
  { fromLine: 6, clips: [[34.6, 43.1]] },
]

/** 3. The solution. Four steps light up beside the real app. */
function SolutionScene({ lines, durationInFrames }: SceneProps) {
  const steps = [
    { line: 1, title: 'A free Sneaker NFT', detail: 'and testnet MON for gas' },
    { line: 3, title: 'Walk, then press STOP', detail: 'GPS tracks the run' },
    { line: 4, title: 'Your run is saved on Monad', detail: 'You get STRIDE in your wallet' },
    { line: 6, title: 'Repair and level up', detail: 'Use STRIDE on your Sneaker' },
  ]
  return (
    <>
      <Label text="How it works" tone="light" />
      <Headline text="Free to start." tone="light" startFrame={lineStart(lines, 0)} />
      {steps.map((step, stepIndex) => (
        <ListRow
          key={step.title}
          activeFrame={lineStart(lines, step.line)}
          tone="light"
          index={String(stepIndex + 1).padStart(2, '0')}
          title={step.title}
          detail={step.detail}
          style={{ top: 360 + stepIndex * 128 }}
        />
      ))}
      <PitchPhone
        tone="light"
        segments={SOLUTION_SEGMENTS}
        sceneLines={lines}
        sceneDurationInFrames={durationInFrames}
      />
    </>
  )
}

/** 4. Why Monad. The repair's transaction on MonadVision. */
function MonadScene({ lines, durationInFrames }: SceneProps) {
  const reasons = [
    { title: 'Fast', detail: 'Every run is its own transaction' },
    { title: 'Cheap gas', detail: 'Free gas for new players' },
    { title: 'Works like Ethereum', detail: 'MetaMask just works' },
  ]
  return (
    <>
      <Label text="Why Monad" tone="dark" />
      <Headline text="Why Monad?" tone="dark" startFrame={lineStart(lines, 0)} />
      {reasons.map((reason, reasonIndex) => (
        <ListRow
          key={reason.title}
          activeFrame={lineStart(lines, reasonIndex + 1)}
          tone="dark"
          index={String(reasonIndex + 1).padStart(2, '0')}
          title={reason.title}
          detail={reason.detail}
          style={{ top: 360 + reasonIndex * 150 }}
        />
      ))}
      <PitchPhone
        tone="dark"
        segments={[{ fromLine: 0, clips: [[43.3, 47.5]] }]}
        sceneLines={lines}
        sceneDurationInFrames={durationInFrames}
      />
    </>
  )
}

/** 5. Why I'm building it. The Sneaker the contract draws. */
function WhyScene({ lines }: SceneProps) {
  const markups = useSvgMarkups([SNEAKER_ART_PATH])
  const markup = markups?.get(SNEAKER_ART_PATH)
  return (
    <>
      <Label text="Why I’m building it" tone="light" />
      <Headline
        text="Connect your workouts with Web3."
        tone="light"
        startFrame={lineStart(lines, 0)}
        fontSize={96}
        width={900}
      />
      <Enter
        startFrame={lineStart(lines, 1)}
        style={{ left: pitchLayout.gutter, top: 470, width: 860 }}
      >
        <div
          style={{
            fontFamily: fontFamilies.satoshi,
            fontSize: 44,
            lineHeight: 1.25,
            color: colors.textSecondarySmall,
          }}
        >
          A Sneaker you own on-chain is a reason to keep walking and running.
        </div>
      </Enter>
      {markup !== undefined && (
        <Enter startFrame={0} style={{ left: 1180, top: 110 }}>
          <div style={{ borderRadius: radii.medium * 2, overflow: 'hidden' }}>
            <SvgArt markup={markup} width={600} />
          </div>
          <div style={{ marginTop: 20 }}>
            <MetaLabel text="Sneaker #2  •  Drawn by a contract" tone="light" />
          </div>
        </Enter>
      )}
    </>
  )
}

/** 6. What's next. Founding Pass designs, drawn by the pass's contract. */
function NextScene({ lines }: SceneProps) {
  const paths = PASS_GRID_DESIGN_NUMBERS.map(toPassCardPath)
  const markups = useSvgMarkups(paths)
  const items = [
    {
      line: 0,
      title: '1,000 free Founding Passes',
      detail: 'Each its own design, drawn on-chain, can’t be sold',
    },
    { line: 2, title: 'Google Play', detail: 'The app is in review' },
    { line: 3, title: 'The waitlist', detail: 'stridemon.xyz' },
  ]
  const cardSize = 230
  const cardGap = 20
  return (
    <>
      <Label text="What’s next" tone="dark" />
      {items.map((item, itemIndex) => (
        <ListRow
          key={item.title}
          activeFrame={lineStart(lines, item.line)}
          tone="dark"
          index={String(itemIndex + 1).padStart(2, '0')}
          title={item.title}
          detail={item.detail}
          style={{ top: 230 + itemIndex * 170, width: 980 }}
        />
      ))}
      {markups !== null &&
        paths.map((path, cardIndex) => {
          const markup = markups.get(path)
          if (markup === undefined) return null
          const column = cardIndex % PASS_GRID_COLUMN_COUNT
          const row = Math.floor(cardIndex / PASS_GRID_COLUMN_COUNT)
          return (
            <Enter
              key={path}
              startFrame={lineStart(lines, 0) + cardIndex * 3}
              style={{
                left: 1060 + column * (cardSize + cardGap),
                top: 170 + row * (cardSize + cardGap),
                borderRadius: radii.medium,
                overflow: 'hidden',
              }}
            >
              <SvgArt markup={markup} width={cardSize} />
            </Enter>
          )
        })}
      <Enter startFrame={lineStart(lines, 0) + 18} style={{ left: 1060, top: 680 }}>
        <MetaLabel text="Founding Pass designs  •  Drawn on-chain" tone="dark" />
      </Enter>
    </>
  )
}

/** 7. End card. The disclaimer is on screen for the whole card. */
function EndScene() {
  const markups = useSvgMarkups([SNEAKER_ART_PATH])
  const markup = markups?.get(SNEAKER_ART_PATH)
  const pillHeight = 84
  return (
    <>
      <Enter startFrame={0} style={{ left: pitchLayout.gutter, top: 230 }}>
        <div
          style={{
            fontFamily: fontFamilies.satoshi,
            fontSize: 150,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: colors.textPrimary,
          }}
        >
          StrideMon
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: fontFamilies.satoshi,
            fontSize: 48,
            color: colors.textSecondarySmall,
          }}
        >
          Walk. Earn. Upgrade.
        </div>
      </Enter>
      <Enter startFrame={6} style={{ left: pitchLayout.gutter, top: 530 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div
            style={{
              height: pillHeight,
              borderRadius: radii.pill,
              backgroundColor: colors.surface,
              boxShadow: floatingPillShadow,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: `0 ${pillHeight * 0.4}px 0 ${pillHeight * 0.45}px`,
              fontFamily: fontFamilies.satoshi,
              fontWeight: fontWeights.medium,
              fontSize: 36,
              color: colors.textPrimary,
            }}
          >
            stridemon.xyz
            <ArrowIcon size={38} color={colors.textPrimary} />
          </div>
          <div style={{ fontFamily: fontFamilies.mono, fontSize: 34, color: colors.textPrimary }}>
            @stridemon
          </div>
        </div>
      </Enter>
      <Enter startFrame={12} style={{ left: pitchLayout.gutter, top: 700, width: 1000 }}>
        <div style={{ fontFamily: fontFamilies.satoshi, fontSize: 40, color: colors.textPrimary }}>
          Monad testnet. STRIDE has no monetary value.
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: fontFamilies.satoshi,
            fontSize: 24,
            color: colors.textSecondarySmall,
          }}
        >
          Music: “Fresh” by Bransboynd (Pixabay)
        </div>
      </Enter>
      {markup !== undefined && (
        <Enter startFrame={4} style={{ left: 1240, top: 230 }}>
          <div style={{ borderRadius: radii.medium * 2, overflow: 'hidden' }}>
            <SvgArt markup={markup} width={540} />
          </div>
        </Enter>
      )}
    </>
  )
}
