import { StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { HeroPanel } from '../../../components/ui/HeroPanel'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { formatDuration } from '../../../lib/format/format-duration'
import { colors, fontFamilies, spacing, textStyles } from '../../../theme'
import type { SneakerEnergy } from '../hooks/useSneakerEnergy'

type SneakerCardProps = {
  sneakerTokenId: bigint
  level: number
  efficiency: number
  durability: number
  maxDurability: number
  energy: SneakerEnergy
  explorerUrl: string
}

/**
 * The Sneaker on Home's dark hero panel: id, level, efficiency, durability and energy,
 * all read from chain. The Sneaker's picture takes the middle of the panel in Phase 8.3.
 */
export function SneakerCard({
  sneakerTokenId,
  level,
  efficiency,
  durability,
  maxDurability,
  energy,
  explorerUrl,
}: SneakerCardProps) {
  return (
    <HeroPanel>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Sneaker #{sneakerTokenId.toString()}
        </Text>
        <ExternalLink
          label="Explorer"
          accessibilityLabel={`View Sneaker ${sneakerTokenId} on the explorer`}
          url={explorerUrl}
          tone="onDark"
        />
      </View>

      <View style={styles.stats}>
        <HeroStat label="Level" value={String(level)} />
        <HeroStat label="Efficiency" value={String(efficiency)} />
      </View>

      <View style={styles.bars}>
        <ProgressBar label="Durability" value={durability} maximum={maxDurability} tone="dark" />
        <ProgressBar
          label="Energy"
          value={energy.currentEnergy}
          maximum={energy.maxEnergy}
          tone="dark"
        />
        <Text style={styles.caption}>{describeEnergyRegeneration(energy)}</Text>
      </View>
    </HeroPanel>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function describeEnergyRegeneration({ secondsUntilNextEnergyPoint }: SneakerEnergy): string {
  if (secondsUntilNextEnergyPoint === null)
    return 'Full energy. Every point is one rewarded minute.'
  return `Next energy point in ${formatDuration(secondsUntilNextEnergyPoint)}`
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...textStyles.caption,
    fontFamily: fontFamilies.medium,
    color: colors.textOnDark,
    textTransform: 'uppercase',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sectionSmall,
  },
  stat: {
    gap: spacing.extraSmall,
  },
  statValue: {
    ...textStyles.display,
    fontFamily: fontFamilies.monoRegular,
    letterSpacing: 0,
    color: colors.textOnDark,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
    textTransform: 'uppercase',
  },
  bars: {
    gap: spacing.medium,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
  },
})
