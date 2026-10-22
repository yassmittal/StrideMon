'use client'

import { useSmallStore } from '@/lib/create-small-store'
import { devStatsStore } from '@/lib/dev-stats-store'
import { RENDER_TIERS, renderTierSettings } from '@/lib/render-tier'
import { formatPassNumber } from '@/lib/sneaker-design'
import { visitStore } from '@/lib/visit-store'
import {
  type AnyStoreViewName,
  COLOUR_CHECK_VIEW_NAMES,
  readStoreView,
  STORE_VIEW_NAMES,
} from '@/store/camera-poses'

// Dev only (`bun run dev`): the view switch, the stand switch for the colour check, the tier
// switch, and the frame rate and draw calls.
// It's how the store is compared with the film; Part 2's walk replaces the view switch.

/** The colour check's designs (Part 1, step 7), plus the stand's own #0868. */
const COLOUR_CHECK_STAND_DESIGNS = [868, 137, 52, 29, 542] as const

export function DevPanel() {
  const viewName = useSmallStore(visitStore, (state) => state.viewName)
  const tier = useSmallStore(visitStore, (state) => state.tier)
  const isTierChosenByHand = useSmallStore(visitStore, (state) => state.isTierChosenByHand)
  const standDesignNumber = useSmallStore(visitStore, (state) => state.standDesignNumber)
  const stats = useSmallStore(devStatsStore, (state) => state)
  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-20 flex max-w-[min(560px,calc(100vw-24px))] flex-col gap-2 rounded-panel bg-black/70 p-3 font-mono text-[11px] text-white uppercase backdrop-blur">
      <p data-testid="dev-stats">
        {stats.framesPerSecond} fps · {stats.drawCallCount} draw calls ·{' '}
        {Math.round(stats.triangleCount / 1000)}k triangles ·{' '}
        {tier === null ? '…' : renderTierSettings[tier].label}
        {isTierChosenByHand ? ' (by hand)' : ' (auto)'}
      </p>
      <ViewButtons names={STORE_VIEW_NAMES} activeName={viewName} />
      <ViewButtons names={COLOUR_CHECK_VIEW_NAMES} activeName={viewName} />
      <div className="flex flex-wrap gap-1">
        {COLOUR_CHECK_STAND_DESIGNS.map((designNumber) => (
          <DevButton
            key={designNumber}
            label={`Stand ${formatPassNumber(designNumber)}`}
            isActive={standDesignNumber === designNumber}
            onPress={() => visitStore.update({ standDesignNumber: designNumber })}
            testId={`stand-${designNumber}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {RENDER_TIERS.map((tierName) => (
          <DevButton
            key={tierName}
            label={renderTierSettings[tierName].label}
            isActive={tier === tierName}
            onPress={() => visitStore.update({ tier: tierName, isTierChosenByHand: true })}
          />
        ))}
      </div>
    </div>
  )
}

function ViewButtons({
  names,
  activeName,
}: {
  names: readonly AnyStoreViewName[]
  activeName: AnyStoreViewName
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <DevButton
          key={name}
          label={readStoreView(name).label}
          isActive={name === activeName}
          onPress={() => visitStore.update({ viewName: name })}
          testId={`view-${name}`}
        />
      ))}
    </div>
  )
}

function DevButton({
  label,
  isActive,
  onPress,
  testId,
}: {
  label: string
  isActive: boolean
  onPress: () => void
  testId?: string
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onPress}
      className={`rounded-full px-2.5 py-1 ${isActive ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
    >
      {label}
    </button>
  )
}
