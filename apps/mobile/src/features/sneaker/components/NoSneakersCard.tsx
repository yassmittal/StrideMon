import { StyleSheet, Text } from 'react-native'
import { Card } from '../../../components/ui/Card'
import { colors, fontSizes, fontWeights } from '../../../theme'

type NoSneakersCardProps = {
  walletAddress: string
}

/**
 * The wallet sent its only Sneaker away. The starter is one per wallet (D-027), so the
 * way back is someone sending one here. Ownership is polled, so it appears by itself.
 */
export function NoSneakersCard({ walletAddress }: NoSneakersCardProps) {
  return (
    <Card>
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
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
  },
  walletAddress: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
})
