import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, layout, radii, spacing } from '../../theme'
import { IconCircleButton } from './IconCircleButton'
import { MetaLabel } from './MetaLabel'

type BottomSheetProps = {
  isVisible: boolean
  /** The sheet's state as tiny metadata, top left: `REVIEW`, `STEP 1 OF 2 • AWAITING SIGNATURE`. */
  metaItems: readonly string[]
  /** While `false` (the wallet or the server is busy), the sheet can't be dismissed. */
  isDismissible: boolean
  onClosePress: () => void
  children: ReactNode
}

/** A sheet that slides up over a dimmed screen, with a close button while it can be dismissed. */
export function BottomSheet({
  isVisible,
  metaItems,
  isDismissible,
  onClosePress,
  children,
}: BottomSheetProps) {
  const safeAreaInsets = useSafeAreaInsets()

  function handleRequestClose() {
    if (isDismissible) onClosePress()
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleRequestClose}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
          disabled={!isDismissible}
        />
        <View
          style={[styles.sheet, { paddingBottom: spacing.large + safeAreaInsets.bottom }]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <MetaLabel items={metaItems} />
            {isDismissible && (
              <IconCircleButton icon="close" accessibilityLabel="Close" onPress={onClosePress} />
            )}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.backdrop,
  },
  sheet: {
    paddingTop: spacing.small,
    paddingHorizontal: spacing.large,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    backgroundColor: colors.background,
    gap: spacing.medium,
  },
  handle: {
    alignSelf: 'center',
    width: spacing.extraLarge + spacing.small,
    height: spacing.extraSmall,
    borderRadius: radii.pill,
    backgroundColor: colors.overlayOnLight,
  },
  // Keeps its height when the close button hides, so the content doesn't jump.
  header: {
    minHeight: layout.iconCircleButtonSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
