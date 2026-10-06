import { StyleSheet, Text, View } from 'react-native'
import { colors, fontFamilies, radii, spacing, textStyles } from '../../../theme'

type TransferConfirmationDetailsProps = {
  sneakerTokenId: bigint
  /** Checksummed, and shown in full so the player can compare it with what they meant. */
  recipientWalletAddress: string
}

/** What a transfer does, with the one thing the player must not miss: the Sneaker leaves. */
export function TransferConfirmationDetails({
  sneakerTokenId,
  recipientWalletAddress,
}: TransferConfirmationDetailsProps) {
  return (
    <>
      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sneaker</Text>
          <Text style={styles.rowValue}>#{sneakerTokenId.toString()}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.rowLabel}>To</Text>
        <Text style={styles.walletAddress} selectable>
          {recipientWalletAddress}
        </Text>
      </View>
      <View style={styles.warning} accessibilityRole="alert">
        <Text style={styles.warningTitle}>You will no longer own this Sneaker.</Text>
        <Text style={styles.warningBody}>
          Only the new owner can send it back. Its level, efficiency and durability go with it.
        </Text>
      </View>
      <Text style={styles.caption}>
        There’s no STRIDE cost. Your wallet opens next to approve it, and Monad charges a small fee
        in MON.
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  rows: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.surface,
    gap: spacing.small,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  rowValue: {
    ...textStyles.body,
    fontFamily: fontFamilies.monoRegular,
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.overlayOnLight,
  },
  walletAddress: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
  },
  warning: {
    padding: spacing.medium,
    borderRadius: radii.medium,
    backgroundColor: colors.dangerSurface,
    gap: spacing.extraSmall,
  },
  warningTitle: {
    ...textStyles.body,
    color: colors.danger,
  },
  warningBody: {
    ...textStyles.caption,
    color: colors.textPrimary,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
