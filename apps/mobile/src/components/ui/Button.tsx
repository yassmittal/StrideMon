import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { colors, layout, motion, radii, shadows, spacing, textStyles } from '../../theme'

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

/** A pill with Lusion's press animations: the label rolls, and the dot fades or floods. */
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
  const [pillWidth, setPillWidth] = useState(0)

  function animatePress(toValue: 0 | 1) {
    Animated.timing(pressProgress, {
      toValue,
      duration: variant === 'callToAction' ? motion.durationSlow : motion.durationMedium,
      easing: variant === 'callToAction' ? motion.easingEmphasized : motion.easingStandard,
      // Colors animate too, and the native driver only animates transforms and opacity.
      useNativeDriver: false,
    }).start()
  }

  const variantColors = VARIANT_COLORS[variant]
  const backgroundColor = isInteractive
    ? pressProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [variantColors.background, variantColors.pressedBackground],
      })
    : colors.disabled
  const labelColor = isInteractive
    ? pressProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [variantColors.label, variantColors.pressedLabel],
      })
    : colors.textPlaceholder

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
      disabled={!isInteractive}
      onPress={onPress}
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
      onLayout={(event: LayoutChangeEvent) => setPillWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.pill,
          variant === 'callToAction' && styles.pillCallToAction,
          { backgroundColor },
        ]}
      >
        {variant === 'callToAction' && isInteractive && (
          <FloodingDot pressProgress={pressProgress} pillWidth={pillWidth} />
        )}
        {isLoading ? (
          <ActivityIndicator color={variantColors.label} />
        ) : (
          <RollingLabel label={label} color={labelColor} pressProgress={pressProgress} />
        )}
        {variant === 'primary' && isInteractive && !isLoading && (
          <FadingDot pressProgress={pressProgress} />
        )}
        {variant === 'secondary' && isInteractive && !isLoading && <TwoDots />}
      </Animated.View>
    </Pressable>
  )
}

const VARIANT_COLORS: Record<
  ButtonVariant,
  { background: string; pressedBackground: string; label: string; pressedLabel: string }
> = {
  primary: {
    background: colors.primary,
    pressedBackground: colors.primaryPressed,
    label: colors.textOnPrimary,
    pressedLabel: colors.textOnPrimary,
  },
  secondary: {
    background: colors.surfaceMuted,
    pressedBackground: colors.surface,
    label: colors.textPrimary,
    pressedLabel: colors.textPrimary,
  },
  callToAction: {
    background: colors.surface,
    pressedBackground: colors.surface,
    label: colors.textPrimary,
    pressedLabel: colors.textOnPrimary,
  },
}

/** Interaction 1 (text roll): the label slides up and out while its copy rolls in from below. */
function RollingLabel({
  label,
  color,
  pressProgress,
}: {
  label: string
  color: Animated.AnimatedInterpolation<string> | string
  pressProgress: Animated.Value
}) {
  const translateY = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -LABEL_LINE_HEIGHT],
  })
  return (
    <View style={styles.labelWindow}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Animated.Text style={[styles.label, { color }]} numberOfLines={1}>
          {label}
        </Animated.Text>
        {/* The copy that rolls in. Hidden from screen readers and from tests' text queries. */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Animated.Text style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </Animated.Text>
        </View>
      </Animated.View>
    </View>
  )
}

/** Interaction 3: the primary pill's white dot shrinks away as it's pressed. */
function FadingDot({ pressProgress }: { pressProgress: Animated.Value }) {
  const scale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
  return <Animated.View style={[styles.dot, styles.dotOnPrimary, { transform: [{ scale }] }]} />
}

function TwoDots() {
  return (
    <View style={styles.twoDots}>
      <View style={[styles.dot, styles.dotOnSecondary]} />
      <View style={[styles.dot, styles.dotOnSecondary]} />
    </View>
  )
}

/** Interaction 2 (dot fill): the black dot grows and turns blue until it floods the pill. */
function FloodingDot({
  pressProgress,
  pillWidth,
}: {
  pressProgress: Animated.Value
  pillWidth: number
}) {
  // Big enough that the dot, centered near the left edge, covers the far end of the pill.
  const floodScale = Math.max((2 * pillWidth) / layout.callToActionDotSize, 1)
  const scale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [1, floodScale] })
  const backgroundColor = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textPrimary, colors.accent],
  })
  return <Animated.View style={[styles.floodingDot, { backgroundColor, transform: [{ scale }] }]} />
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
    paddingLeft: spacing.large + layout.callToActionDotSize + spacing.medium,
    boxShadow: shadows.floatingPill,
  },
  labelWindow: {
    height: LABEL_LINE_HEIGHT,
    overflow: 'hidden',
  },
  label: {
    ...textStyles.button,
    textTransform: 'uppercase',
  },
  dot: {
    width: layout.pillDotSize,
    height: layout.pillDotSize,
    borderRadius: radii.pill,
  },
  dotOnPrimary: {
    backgroundColor: colors.textOnPrimary,
  },
  dotOnSecondary: {
    backgroundColor: colors.textPrimary,
  },
  twoDots: {
    flexDirection: 'row',
    gap: layout.pillDotSize,
  },
  floodingDot: {
    position: 'absolute',
    left: spacing.large,
    width: layout.callToActionDotSize,
    height: layout.callToActionDotSize,
    borderRadius: radii.pill,
  },
})
