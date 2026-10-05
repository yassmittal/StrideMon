import { useRef } from 'react'
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, layout, motion, radii, shadows, spacing, textStyles } from '../../theme'
import { Icon } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'callToAction'

type ButtonProps = {
  label: string
  onPress: () => void
  /**
   * design-system.md §8: `primary` is the dark pill (sign in, STOP, confirm), `secondary`
   * the grey one beside it, `callToAction` the white floating pill (START RUN, repair, upgrade).
   */
  variant?: ButtonVariant
  accessibilityLabel?: string
  isDisabled?: boolean
  isLoading?: boolean
}

const LABEL_LINE_HEIGHT = textStyles.button.lineHeight ?? 0

/**
 * A pill with a quiet press: the background steps one shade, the label rolls and the arrow
 * nudges right (D-029, D-031). Every press animation runs on the native driver, so it never
 * stalls while the JS thread is busy opening the wallet or changing screens.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  isDisabled = false,
  isLoading = false,
}: ButtonProps) {
  const isInteractive = !isDisabled && !isLoading
  const pressProgress = useRef(new Animated.Value(0)).current

  function animatePress(toValue: 0 | 1) {
    Animated.timing(pressProgress, {
      toValue,
      duration: motion.durationBase,
      easing: motion.easingStandard,
      useNativeDriver: true,
    }).start()
  }

  const variantColors = VARIANT_COLORS[variant]
  const labelColor = isInteractive ? variantColors.label : colors.textPlaceholder
  const arrow = isLoading ? null : <PressArrow pressProgress={pressProgress} color={labelColor} />

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
      disabled={!isInteractive}
      onPress={onPress}
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
    >
      <View
        style={[
          styles.pill,
          variant === 'callToAction' && styles.pillCallToAction,
          { backgroundColor: isInteractive ? variantColors.background : colors.disabled },
        ]}
      >
        {isInteractive && (
          <Animated.View
            style={[
              styles.pressedFill,
              { backgroundColor: variantColors.pressedBackground, opacity: pressProgress },
            ]}
          />
        )}
        {variant === 'callToAction' && <View style={styles.leadingArrow}>{arrow}</View>}
        {isLoading ? (
          <ActivityIndicator color={variantColors.label} />
        ) : (
          <RollingLabel label={label} color={labelColor} pressProgress={pressProgress} />
        )}
        {variant !== 'callToAction' && arrow}
      </View>
    </Pressable>
  )
}

const VARIANT_COLORS: Record<
  ButtonVariant,
  { background: string; pressedBackground: string; label: string }
> = {
  primary: {
    background: colors.primary,
    pressedBackground: colors.textPrimary,
    label: colors.textOnPrimary,
  },
  secondary: {
    background: colors.surfaceMuted,
    pressedBackground: colors.surface,
    label: colors.textPrimary,
  },
  callToAction: {
    background: colors.surface,
    pressedBackground: colors.surfaceMuted,
    label: colors.textPrimary,
  },
}

/** Interaction 1 (text roll): the label slides up and out while its copy rolls in from below. */
function RollingLabel({
  label,
  color,
  pressProgress,
}: {
  label: string
  color: string
  pressProgress: Animated.Value
}) {
  const translateY = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LABEL_LINE_HEIGHT],
  })
  return (
    <View style={styles.labelWindow}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </Text>
        {/* The copy that rolls in. Hidden from screen readers and from tests' text queries. */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}

/** The arrow that stands in for Lusion's dot (D-029). It nudges right while pressed. */
function PressArrow({ pressProgress, color }: { pressProgress: Animated.Value; color: string }) {
  const translateX = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, spacing.extraSmall],
  })
  return (
    <Animated.View style={[styles.arrow, { transform: [{ translateX }] }]}>
      <Icon name="arrowRight" color={color} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  pill: {
    minHeight: layout.pillHeight,
    paddingLeft: spacing.large,
    paddingRight: spacing.medium,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    overflow: 'hidden',
  },
  pillCallToAction: {
    minHeight: layout.callToActionPillHeight,
    paddingLeft: spacing.large + layout.iconSize + spacing.medium,
    boxShadow: shadows.floatingPill,
  },
  pressedFill: {
    ...StyleSheet.absoluteFill,
  },
  labelWindow: {
    height: LABEL_LINE_HEIGHT,
    overflow: 'hidden',
  },
  label: {
    ...textStyles.button,
    textTransform: 'uppercase',
  },
  arrow: {
    width: layout.iconSize,
    height: layout.iconSize,
  },
  leadingArrow: {
    position: 'absolute',
    left: spacing.large,
  },
})
