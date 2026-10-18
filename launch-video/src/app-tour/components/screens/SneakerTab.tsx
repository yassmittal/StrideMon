import type { ReactNode } from 'react'
import { Freeze } from 'remotion'
import { RollingDigits, type RollingDigitsStep } from '../../../components/RollingDigits'
import { SneakerArt } from '../../../components/SneakerArt'
import { REEL_HEIGHT_PIXELS, REEL_WIDTH_PIXELS } from '../../footage'
import { ReelFootage } from '../ReelFootage'
import {
  appColors,
  appLayoutSizes,
  appPageGutter,
  appRadii,
  appSpacing,
  appTextStyles,
  toReelPixels,
} from './app-styles'
import { PrimaryPill, StatChangeRow, type StatChangeValues } from './TransactionSheet'

// A vector rebuild of the app's Sneaker tab (app/(tabs)/sneaker.tsx: ScreenTitle, SneakerCard,
// RepairPanel, UpgradePanel, TransferPanel), in reel pixels, scrollable. The tab bar is the reel's
// own (a still from the sneaker-tab clip), so no icon is redrawn. Calibrated against the reel's
// Sneaker tab (34.9 s and 35.9 s) and its Upgrade panel (49.0 s) with
// scripts/check-app-tour-rebuilds.py, then given the film's states.

/** The reel's tab bar: its top border is at 1433, and it runs to the bottom. */
const TAB_BAR_TOP_PIXELS = 1432
/** A frame of the sneaker-tab clip after the tab's ripple has gone, before the press. */
const TAB_BAR_CLIP_FRAME = 58
/** The reel keeps a sliver of the status bar's inset above the page: its content starts this low. */
const TOP_INSET_PIXELS = 13
/** The scroll view ends here, 30 px above the tab bar; the page shows between them (34.9, 35.9 s). */
const SCROLL_VIEWPORT_BOTTOM_PIXELS = 1402

export type ActionPanelState = {
  title: string
  cost: string
  description: string
  statChanges: readonly StatChangeValues[]
  actionLabel: string
  isActionDisabled: boolean
  isActionPressed?: boolean
  /** "You have 10 STRIDE.", a blocked reason, or nothing (the film leaves out balances). */
  caption?: string
}

export type SneakerTabState = {
  /** The renderer's picture (public/sneaker/), already loaded. */
  artMarkup: string
  /** Draws a new speed line from here (the upgrade). */
  newSpeedLineStartFrame?: number
  efficiencySteps: readonly RollingDigitsStep[]
  energy: number
  maxEnergy: number
  energyCaption: string
  repair: ActionPanelState
  upgrade: ActionPanelState
  transferTitle: string
  /** How far the page is scrolled, in reel pixels. */
  scrollOffset: number
}

const TRANSFER_DESCRIPTION = 'It’s an NFT you own. Its level, efficiency and durability go with it.'

export function SneakerTab({ state }: { state: SneakerTabState }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: REEL_WIDTH_PIXELS,
        height: REEL_HEIGHT_PIXELS,
        overflow: 'hidden',
        backgroundColor: appColors.background,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: TOP_INSET_PIXELS,
          width: REEL_WIDTH_PIXELS,
          height: SCROLL_VIEWPORT_BOTTOM_PIXELS - TOP_INSET_PIXELS,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            // Whole pixels, so the text and the art's strokes move together.
            top: -Math.round(state.scrollOffset),
            width: REEL_WIDTH_PIXELS,
            boxSizing: 'border-box',
            padding: `${appSpacing.medium}px ${appPageGutter}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: appSpacing.small,
          }}
        >
          <ScreenTitle />
          <SneakerCard state={state} />
          <ActionPanel panel={state.repair} />
          <ActionPanel panel={state.upgrade} />
          <TransferPanel title={state.transferTitle} />
        </div>
      </div>
      <TabBar />
    </div>
  )
}

function ScreenTitle() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: appSpacing.extraSmall,
        paddingBottom: appSpacing.small,
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
        {['Repair', 'Upgrade', 'Send'].join('  •  ')}
      </div>
      <div
        style={{
          ...appTextStyles.heading,
          color: appColors.textPrimary,
          marginLeft: toReelPixels(47 * -0.05),
        }}
      >
        Sneaker
      </div>
    </div>
  )
}

function SneakerCard({ state }: { state: SneakerTabState }) {
  const titleFontSize = appTextStyles.titleMono.fontSize as number
  return (
    <div
      style={{
        padding: appSpacing.large,
        borderRadius: appRadii.medium,
        backgroundColor: appColors.darkPanel,
        display: 'flex',
        flexDirection: 'column',
        gap: appSpacing.large,
        overflow: 'hidden',
      }}
    >
      <div style={{ margin: `${-appSpacing.large}px ${-appSpacing.large}px 0` }}>
        <SneakerArt
          markup={state.artMarkup}
          size={REEL_WIDTH_PIXELS - 2 * appPageGutter}
          {...(state.newSpeedLineStartFrame === undefined
            ? {}
            : { newSpeedLineStartFrame: state.newSpeedLineStartFrame })}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingTop: appSpacing.large,
          borderTop: `1px solid ${appColors.overlayOnDark}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: appSpacing.extraSmall }}>
          <div
            style={{
              ...appTextStyles.caption,
              color: appColors.textOnDarkMuted,
              textTransform: 'uppercase',
            }}
          >
            Efficiency
          </div>
          <div
            style={{
              ...appTextStyles.titleMono,
              position: 'relative',
              height: appTextStyles.titleMono.lineHeight,
            }}
          >
            <RollingDigits
              steps={state.efficiencySteps}
              fontSize={titleFontSize}
              color={appColors.textOnDark}
              style={{
                top: (parseFloat(String(appTextStyles.titleMono.lineHeight)) - titleFontSize) / 2,
              }}
            />
          </div>
        </div>
        <div style={{ minHeight: toReelPixels(44), display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              ...appTextStyles.captionMedium,
              color: appColors.textOnDark,
              textTransform: 'uppercase',
              whiteSpace: 'pre',
            }}
          >
            {'Explorer ↗'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: appSpacing.medium }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: appSpacing.small }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span
              style={{
                ...appTextStyles.caption,
                color: appColors.textOnDark,
                textTransform: 'uppercase',
              }}
            >
              Energy
            </span>
            <span
              style={{
                ...appTextStyles.captionMono,
                color: appColors.textOnDark,
                whiteSpace: 'pre',
              }}
            >
              {`${state.energy} / ${state.maxEnergy}`}
            </span>
          </div>
          <div
            style={{
              height: appLayoutSizes.progressTrackHeight,
              borderRadius: appRadii.tiny,
              backgroundColor: appColors.darkTrack,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(state.energy / state.maxEnergy) * 100}%`,
                height: '100%',
                borderRadius: appRadii.tiny,
                backgroundColor: appColors.highlight,
              }}
            />
          </div>
        </div>
        <div style={{ ...appTextStyles.caption, color: appColors.textOnDarkMuted }}>
          {state.energyCaption}
        </div>
      </div>
    </div>
  )
}

function ActionPanel({ panel }: { panel: ActionPanelState }) {
  return (
    <Panel>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...appTextStyles.title, color: appColors.textPrimary }}>{panel.title}</div>
        <div
          style={{
            padding: `${appSpacing.extraSmall}px ${appSpacing.medium}px`,
            borderRadius: 999,
            backgroundColor: appColors.surfaceMuted,
          }}
        >
          <span
            style={{
              ...appTextStyles.captionMono,
              color: appColors.textPrimary,
              textTransform: 'uppercase',
              whiteSpace: 'pre',
            }}
          >
            {panel.cost}
          </span>
        </div>
      </div>
      <div style={{ ...appTextStyles.body, color: appColors.textSecondary }}>
        {panel.description}
      </div>
      {panel.statChanges.length > 0 && (
        <div
          style={{
            padding: appSpacing.medium,
            borderRadius: appRadii.medium,
            backgroundColor: appColors.background,
            display: 'flex',
            flexDirection: 'column',
            gap: appSpacing.small,
          }}
        >
          {panel.statChanges.map((statChange) => (
            <StatChangeRow key={statChange.label} {...statChange} />
          ))}
        </div>
      )}
      <PrimaryPill
        label={panel.actionLabel}
        isDisabled={panel.isActionDisabled}
        isPressed={panel.isActionPressed ?? false}
      />
      {panel.caption !== undefined && (
        <div style={{ ...appTextStyles.caption, color: appColors.textSecondary }}>
          {panel.caption}
        </div>
      )}
    </Panel>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: appSpacing.large,
        borderRadius: appRadii.medium,
        backgroundColor: appColors.surface,
        display: 'flex',
        flexDirection: 'column',
        gap: appSpacing.medium,
      }}
    >
      {children}
    </div>
  )
}

/** DarkPanel.tsx: the black "SEND SNEAKER #3 →" panel. */
function TransferPanel({ title }: { title: string }) {
  return (
    <div
      style={{
        minHeight: toReelPixels(44),
        padding: `${appSpacing.large}px ${appSpacing.extraLarge}px`,
        borderRadius: appRadii.medium,
        backgroundColor: appColors.darkBackground,
        display: 'flex',
        flexDirection: 'column',
        gap: appSpacing.small,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: appSpacing.medium,
        }}
      >
        <span
          style={{
            ...appTextStyles.menuItem,
            color: appColors.textOnDark,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <span style={{ ...appTextStyles.menuItem, color: appColors.highlight }}>→</span>
      </div>
      <div style={{ ...appTextStyles.caption, color: appColors.textOnDarkMuted }}>
        {TRANSFER_DESCRIPTION}
      </div>
    </div>
  )
}

function TabBar() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: TAB_BAR_TOP_PIXELS,
        width: REEL_WIDTH_PIXELS,
        height: REEL_HEIGHT_PIXELS - TAB_BAR_TOP_PIXELS,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -TAB_BAR_TOP_PIXELS,
          width: REEL_WIDTH_PIXELS,
          height: REEL_HEIGHT_PIXELS,
        }}
      >
        <Freeze frame={TAB_BAR_CLIP_FRAME}>
          <ReelFootage clipName="sneaker-tab" />
        </Freeze>
      </div>
    </div>
  )
}
