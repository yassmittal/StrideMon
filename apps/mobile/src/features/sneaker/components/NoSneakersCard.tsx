import { StyleSheet, Text } from 'react-native'
import { Panel } from '../../../components/ui/Panel'
import { colors, fontFamilies, textStyles } from '../../../theme'

type NoSneakersCardProps = {
  walletAddress: string
}

/**
 * The wallet sent its only Sneaker away. The starter is one per wallet (D-027), so the
 * way back is someone sending one here. Ownership is polled, so it appears by itself.
 */
export function NoSneakersCard({ walletAddress }: NoSneakersCardProps) {
  return (
    <Panel>
      <Text style={styles.title} accessibilityRole="header">
        No Sneakers in this wallet
      </Text>
      <Text style={styles.body}>
        Your Sneaker now belongs to another wallet. Each wallet gets one free starter, so to run
        again, someone needs to send you a Sneaker. Share this address:
      </Text>
      <Text style={styles.walletAddress} selectable accessibilityLabel={`Wallet ${walletAddress}`}>
        {walletAddress}
      </Text>
      <Text style={styles.caption}>A Sneaker sent here shows up by itself.</Text>
    </Panel>
  )
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  body: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  walletAddress: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoMedium,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
