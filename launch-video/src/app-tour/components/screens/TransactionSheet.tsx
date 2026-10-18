import type { ReactNode } from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { ArrowIcon } from '../../../components/ArrowIcon'
import { RollingDigits } from '../../../components/RollingDigits'
import { easings } from '../../../theme'
import { REEL_WIDTH_PIXELS } from '../../footage'
import {
  appColors,
  appLayoutSizes,
  appRadii,
  appSpacing,
  appTextStyles,
  toReelPixels,
} from './app-styles'

// A vector rebuild of the app's transaction bottom sheet (BottomSheet.tsx, SneakerTransactionSheet.tsx,
// SneakerTransactionSteps.tsx), in reel pixels. Calibrated against the reel's repair sheets
// ("Confirming on Monad…" at 40.50 s, "Sneaker repaired" at 41.2 s) with
// scripts/check-app-tour-rebuilds.py, then given the upgrade's words and numbers.

/** The gesture bar's inset under the sheet (measured: the sheet's padding ends 34 px above the bottom). */
const BOTTOM_INSET_PIXELS = 34
/** The sheet's side padding as the reel draws it: 36.5 px, a pixel under 20 pt (native rounding). */
const SIDE_PADDING_PIXELS = 36.5
const SPINNER_SIZE_PIXELS = toReelPixels(36)
const SPINNER_STROKE_PIXELS = toReelPixels(3.5)
/** How long the app's Modal takes to slide the sheet up or down (React Native's slide, about 300 ms). */
export const SHEET_SLIDE_DURATION_FRAMES = 18

export type StatChangeValues = {
  label: string
  valueBefore: string
  valueAfter: string
  /** When the "after" value rolls in from the "before" one (RollingDigits). */
  rollStartFrame?: number
}

export type TransactionSheetState =
  | { phase: 'confirming'; metaItems: readonly string[]; title: string; caption: string }
  | {
      phase: 'succeeded'
      metaItems: readonly string[]
      title: string
      caption: string
      statChanges: readonly StatChangeValues[]
      viewTransactionLabel: string
      doneLabel: string
    }

type TransactionSheetProps = {
  state: TransactionSheetState
  /** The sheet slides up from here (omit: already up). */
  openFrame?: number
  /** The sheet slides down from here (omit: stays up). */
  closeFrame?: number
  /** Turns the spinner, so a check can match a reel frame's phase. */
  spinnerPhaseDegrees?: number
}

/** The dimmed backdrop and the sheet, laid over a screen at 720 × 1560. */
export function TransactionSheet({
  state,
  openFrame,
  closeFrame,
  spinnerPhaseDegrees = 0,
}: TransactionSheetProps) {
  const frame = useCurrentFrame()
  const slideIn =
    openFrame === undefined
      ? 1
      : interpolate(frame, [openFrame, openFrame + SHEET_SLIDE_DURATION_FRAMES], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easings.standard,
        })
  const slideOut =
    closeFrame === undefined
      ? 0
      : interpolate(frame, [closeFrame, closeFrame + SHEET_SLIDE_DURATION_FRAMES], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easings.standard,
        })
  const shown = slideIn * (1 - slideOut)
  if (shown <= 0) return null
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: appColors.backdrop,
          opacity: shown,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: REEL_WIDTH_PIXELS,
          translate: `0px ${(1 - shown) * 100}%`,
          paddingTop: appSpacing.small,
          paddingLeft: SIDE_PADDING_PIXELS,
          paddingRight: SIDE_PADDING_PIXELS,
          paddingBottom: appSpacing.large + BOTTOM_INSET_PIXELS,
          borderTopLeftRadius: appRadii.card,
          borderTopRightRadius: appRadii.card,
          backgroundColor: appColors.background,
          display: 'flex',
          flexDirection: 'column',
          gap: appSpacing.medium,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            alignSelf: 'center',
            width: appSpacing.extraLarge + appSpacing.small,
            height: appSpacing.extraSmall,
            borderRadius: 999,
            backgroundColor: appColors.overlayOnLight,
          }}
        />
        <SheetHeader metaItems={state.metaItems} isDismissible={state.phase === 'succeeded'} />
        {state.phase === 'confirming' ? (
          <ConfirmingStep
            title={state.title}
            caption={state.caption}
            spinnerPhaseDegrees={spinnerPhaseDegrees}
          />
        ) : (
          <SucceededStep state={state} />
        )}
      </div>
    </div>
  )
}

function SheetHeader({
  metaItems,
  isDismissible,
}: {
  metaItems: readonly string[]
  isDismissible: boolean
}) {
  return (
    <div
      style={{
        minHeight: appLayoutSizes.iconCircleButtonSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          ...appTextStyles.caption,
          color: appColors.textPrimary,
          textTransform: 'uppercase',
          whiteSpace: 'pre',
        }}
      >
        {metaItems.join('  •  ')}
      </div>
      {isDismissible && <CloseButton />}
    </div>
  )
}

function CloseButton() {
  const size = appLayoutSizes.iconCircleButtonSize
  const glyph = appLayoutSizes.iconSize
  const inset = glyph * 0.22
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: appColors.surfaceMuted,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={glyph} height={glyph} viewBox={`0 0 ${glyph} ${glyph}`} aria-hidden="true">
        <path
          d={`M${inset} ${inset}L${glyph - inset} ${glyph - inset}M${glyph - inset} ${inset}L${inset} ${glyph - inset}`}
          stroke={appColors.textPrimary}
          strokeWidth={toReelPixels(1.5)}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function ConfirmingStep({
  title,
  caption,
  spinnerPhaseDegrees,
}: {
  title: string
  caption: string
  spinnerPhaseDegrees: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: appSpacing.small }}>
      <Spinner phaseDegrees={spinnerPhaseDegrees} />
      <Title text={title} />
      <Caption text={caption} />
      <ViewTransactionLink label="View transaction" />
    </div>
  )
}

function SucceededStep({
  state,
}: {
  state: Extract<TransactionSheetState, { phase: 'succeeded' }>
}) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: appSpacing.small }}>
        <SuccessBadge />
        <Title text={state.title} />
        <Caption text={state.caption} />
      </div>
      <div
        style={{
          padding: appSpacing.medium,
          borderRadius: appRadii.medium,
          backgroundColor: appColors.surface,
          display: 'flex',
          flexDirection: 'column',
          gap: appSpacing.small,
        }}
      >
        {state.statChanges.map((statChange) => (
          <StatChangeRow key={statChange.label} {...statChange} />
        ))}
      </div>
      <div>
        <ViewTransactionLink label={state.viewTransactionLabel} />
      </div>
      <PrimaryPill label={state.doneLabel} />
    </>
  )
}

/** Android's large ActivityIndicator: a rotating arc, about a quarter-turn per 8 frames. */
function Spinner({ phaseDegrees }: { phaseDegrees: number }) {
  const frame = useCurrentFrame()
  const radius = (SPINNER_SIZE_PIXELS - SPINNER_STROKE_PIXELS) / 2
  const circumference = 2 * Math.PI * radius
  // The arc grows and shrinks as it turns, like Material's indeterminate spinner.
  const arcShare = 0.2 + 0.15 * Math.sin(frame / 14)
  return (
    <svg
      width={SPINNER_SIZE_PIXELS}
      height={SPINNER_SIZE_PIXELS}
      style={{ rotate: `${phaseDegrees + frame * 11}deg` }}
      aria-hidden="true"
    >
      <circle
        cx={SPINNER_SIZE_PIXELS / 2}
        cy={SPINNER_SIZE_PIXELS / 2}
        r={radius}
        fill="none"
        stroke={appColors.textPrimary}
        strokeWidth={SPINNER_STROKE_PIXELS}
        strokeLinecap="round"
        strokeDasharray={`${circumference * arcShare} ${circumference}`}
      />
    </svg>
  )
}

function SuccessBadge() {
  const size = appLayoutSizes.successBadgeSize
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: appColors.highlight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* The app's "✓" glyph, drawn: Satoshi has none, and the phone's fallback is a plain check. */}
      <svg width={size * 0.46} height={size * 0.36} viewBox="0 0 46 36" aria-hidden="true">
        <path d="M3 19L16 32L43 3" fill="none" stroke={appColors.textPrimary} strokeWidth="5.2" />
      </svg>
    </div>
  )
}

function Title({ text }: { text: string }) {
  return <div style={{ ...appTextStyles.title, color: appColors.textPrimary }}>{text}</div>
}

function Caption({ text }: { text: string }) {
  return <div style={{ ...appTextStyles.caption, color: appColors.textSecondary }}>{text}</div>
}

function ViewTransactionLink({ label }: { label: string }) {
  return (
    <div style={{ minHeight: toReelPixels(44), display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          ...appTextStyles.captionMedium,
          color: appColors.accent,
          textTransform: 'uppercase',
          whiteSpace: 'pre',
        }}
      >
        {`${label} ↗`}
      </span>
    </div>
  )
}

/** StatChangeRow.tsx: "Efficiency   10 → 12", the after value rolling in when asked. */
export function StatChangeRow({
  label,
  valueBefore,
  valueAfter,
  rollStartFrame,
}: StatChangeValues) {
  const fontSize = appTextStyles.bodyMono.fontSize as number
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: appSpacing.medium,
      }}
    >
      <span style={{ ...appTextStyles.body, color: appColors.textSecondary }}>{label}</span>
      <span style={{ ...appTextStyles.bodyMono, display: 'flex', whiteSpace: 'pre' }}>
        <span style={{ color: appColors.textSecondary }}>{valueBefore}</span>
        <span style={{ color: appColors.accent }}>{'  '}</span>
        <FallbackArrow />
        <span>{'  '}</span>
        {rollStartFrame === undefined ? (
          <span style={{ color: appColors.textPrimary }}>{valueAfter}</span>
        ) : (
          <span
            style={{
              position: 'relative',
              display: 'inline-block',
              width: `${valueAfter.length}ch`,
            }}
          >
            <RollingDigits
              steps={[
                { startFrame: 0, text: valueBefore.padStart(valueAfter.length, ' ') },
                { startFrame: rollStartFrame, text: valueAfter },
              ]}
              fontSize={fontSize}
              color={appColors.textPrimary}
              style={{
                top: (parseFloat(String(appTextStyles.bodyMono.lineHeight)) - fontSize) / 2,
              }}
            />
          </span>
        )}
      </span>
    </div>
  )
}

/**
 * The stat rows' "→". IBM Plex Mono as the app bundles it has no arrow, so Android draws its
 * fallback: a short, heavy arrow in one mono cell, in the accent blue (the reel at 41.2 s).
 */
function FallbackArrow() {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: '1ch',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg width="0.9em" height="0.6em" viewBox="0 0 18 12" aria-hidden="true">
        <path
          d="M2 6H15M10.5 1.8L15 6L10.5 10.2"
          fill="none"
          stroke={appColors.accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** Button.tsx's primary pill: the label and its arrow, centred. */
export function PrimaryPill({
  label,
  isPressed = false,
  isDisabled = false,
}: {
  label: string
  isPressed?: boolean
  isDisabled?: boolean
}): ReactNode {
  const labelColor = isDisabled ? appColors.textPlaceholder : appColors.surface
  const background = isDisabled
    ? appColors.surfaceMuted
    : isPressed
      ? appColors.textPrimary
      : appColors.primary
  return (
    <div
      style={{
        minHeight: appLayoutSizes.pillHeight,
        paddingLeft: appSpacing.large,
        paddingRight: appSpacing.medium,
        borderRadius: 999,
        backgroundColor: background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: appSpacing.small,
      }}
    >
      <span
        style={{
          ...appTextStyles.button,
          color: labelColor,
          textTransform: 'uppercase',
          whiteSpace: 'pre',
        }}
      >
        {label}
      </span>
      <ArrowIcon size={appLayoutSizes.iconSize} color={labelColor} />
    </div>
  )
}
