import { StyleSheet, Text } from 'react-native'
import { formatWalletAddress } from '../../../lib/format/format-wallet-address'
import { colors, fontFamilies, textStyles } from '../../../theme'

type WalletAddressProps = {
  walletAddress: string
}

export function WalletAddress({ walletAddress }: WalletAddressProps) {
  return (
    <Text style={styles.walletAddress} accessibilityLabel={`Wallet ${walletAddress}`}>
      {formatWalletAddress(walletAddress)}
    </Text>
  )
}

const styles = StyleSheet.create({
  walletAddress: {
    ...textStyles.title,
    color: colors.textPrimary,
    fontFamily: fontFamilies.monoRegular,
  },
})
