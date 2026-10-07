import { StyleSheet, Text } from 'react-native'
import { BottomSheet } from '../../../components/ui/BottomSheet'
import { Button } from '../../../components/ui/Button'
import { colors, textStyles } from '../../../theme'

type DeleteAccountSheetProps = {
  isVisible: boolean
  isDeleting: boolean
  hasFailed: boolean
  onConfirmPress: () => void
  onClosePress: () => void
}

/** Confirms account deletion (D-039), and says plainly what stays on-chain. */
export function DeleteAccountSheet({
  isVisible,
  isDeleting,
  hasFailed,
  onConfirmPress,
  onClosePress,
}: DeleteAccountSheetProps) {
  return (
    <BottomSheet
      isVisible={isVisible}
      metaItems={['Delete account']}
      isDismissible={!isDeleting}
      onClosePress={onClosePress}
    >
      <Text style={styles.title} accessibilityRole="header">
        Delete your account?
      </Text>
      <Text style={styles.body}>
        This deletes your run history, the GPS points of your runs and your sign-ins from
        StrideMon’s server. It can’t be undone.
      </Text>
      <Text style={styles.body}>
        Your Sneakers and STRIDE live on Monad, not on our server, so they stay in your wallet. You
        can sign in again later, with a fresh history.
      </Text>
      {hasFailed && (
        <Text style={styles.error} accessibilityRole="alert">
          Couldn’t delete your account. Check your connection and try again.
        </Text>
      )}
      <Button label="Delete account" onPress={onConfirmPress} isLoading={isDeleting} />
      <Button label="Not now" variant="secondary" onPress={onClosePress} isDisabled={isDeleting} />
    </BottomSheet>
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
  error: {
    ...textStyles.body,
    color: colors.danger,
  },
})
