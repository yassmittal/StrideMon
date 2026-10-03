import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import {
  colors,
  fontSizes,
  fontWeights,
  MINIMUM_TOUCH_TARGET_SIZE,
  radii,
  spacing,
} from '../../../theme'

type SneakerPickerProps = {
  sneakerTokenIds: readonly bigint[]
  selectedSneakerTokenId: bigint
  onSneakerPress: (sneakerTokenId: bigint) => void
}

/**
 * Which Sneaker START, repair, upgrade and transfer act on. Shown only once the
 * wallet owns more than one, for example after receiving a transfer.
 */
export function SneakerPicker({
  sneakerTokenIds,
  selectedSneakerTokenId,
  onSneakerPress,
}: SneakerPickerProps) {
  if (sneakerTokenIds.length < 2) return null

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Sneakers ({sneakerTokenIds.length})</Text>
      <FlatList
        horizontal
        data={sneakerTokenIds}
        keyExtractor={(sneakerTokenId) => sneakerTokenId.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item: sneakerTokenId }) => {
          const isSelected = sneakerTokenId === selectedSneakerTokenId
          return (
            <Pressable
              onPress={() => onSneakerPress(sneakerTokenId)}
              accessibilityRole="button"
              accessibilityLabel={`Sneaker ${sneakerTokenId}`}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && !isSelected && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                #{sneakerTokenId.toString()}
              </Text>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  label: {
    fontSize: fontSizes.caption,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.small,
  },
  chip: {
    minWidth: MINIMUM_TOUCH_TARGET_SIZE + spacing.large,
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    paddingHorizontal: spacing.medium,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipPressed: {
    backgroundColor: colors.primarySurface,
  },
  chipLabel: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  chipLabelSelected: {
    color: colors.textOnPrimary,
  },
})
