import { StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { HeroPanel } from '../../../components/ui/HeroPanel'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { formatDuration } from '../../../lib/format/format-duration'
import { colors, fontFamilies, spacing, textStyles } from '../../../theme'
import type { SneakerEnergy } from '../hooks/useSneakerEnergy'
import { SneakerArt } from './SneakerArt'

type SneakerCardProps = {
  sneakerTokenId: bigint
  /** `SneakerNft.imageSvg`, or `undefined` while it loads. */
  imageSvg: string | undefined
  level: number
  efficiency: number
  durability: number
  maxDurability: number
  energy: SneakerEnergy
  explorerUrl: string
}

/**
 * The Sneaker on its dark hero panel, all read from chain. The on-chain picture (D-030) shows
 * the id, level and durability, so below it the card adds what the picture can't: efficiency,
 * live energy and the explorer link.
 */
export function SneakerCard({
  sneakerTokenId,
  imageSvg,
  level,
  efficiency,
  durability,
  maxDurability,
  energy,
  explorerUrl,
}: SneakerCardProps) {
  return (
    <HeroPanel>
      <View style={styles.artBleed}>
        <SneakerArt
          imageSvg={imageSvg}
          accessibilityLabel={`Sneaker #${sneakerTokenId}: level ${level}, durability ${durability} of ${maxDurability}`}
        />
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat} accessible accessibilityLabel={`Efficiency: ${efficiency}`}>
          <Text style={styles.statLabel}>Efficiency</Text>
          <Text style={styles.statValue}>{efficiency}</Text>
        </View>
        <ExternalLink
          label="Explorer"
          accessibilityLabel={`View Sneaker ${sneakerTokenId} on the explorer`}
          url={explorerUrl}
          tone="onDark"
        />
      </View>

      <View style={styles.energy}>
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

function describeEnergyRegeneration({ secondsUntilNextEnergyPoint }: SneakerEnergy): string {
  if (secondsUntilNextEnergyPoint === null)
    return 'Full energy. Every point is one rewarded minute.'
  return `Next energy point in ${formatDuration(secondsUntilNextEnergyPoint)}`
}

const styles = StyleSheet.create({
  // The picture runs to the panel's edges: its background is the panel's own colour.
  artBleed: {
    marginTop: -spacing.large,
    marginHorizontal: -spacing.large,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.large,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.overlayOnDark,
  },
  stat: {
    gap: spacing.extraSmall,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    ...textStyles.title,
    fontFamily: fontFamilies.monoRegular,
    color: colors.textOnDark,
  },
  energy: {
    gap: spacing.medium,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textOnDarkMuted,
  },
})
