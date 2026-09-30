import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { StatValue } from '../../../components/ui/StatValue'
import { formatDuration } from '../../../lib/format/format-duration'
import { colors, fontSizes, fontWeights, spacing } from '../../../theme'
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

/** The Sneaker at a glance: id, level, efficiency, durability and energy, all read from chain. */
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
    <Card>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Sneaker #{sneakerTokenId.toString()}
        </Text>
        <ExternalLink
          label="Explorer"
          accessibilityLabel={`View Sneaker ${sneakerTokenId} on the explorer`}
          url={explorerUrl}
        />
      </View>

      <View style={styles.stats}>
        <StatValue label="Level" value={String(level)} />
        <StatValue label="Efficiency" value={String(efficiency)} />
      </View>

      <ProgressBar label="Durability" value={durability} maximum={maxDurability} />

      <View style={styles.energy}>
        <ProgressBar label="Energy" value={energy.currentEnergy} maximum={energy.maxEnergy} />
        <Text style={styles.caption}>{describeEnergyRegeneration(energy)}</Text>
      </View>
    </Card>
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
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.extraLarge,
  },
  energy: {
    gap: spacing.small,
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
})
