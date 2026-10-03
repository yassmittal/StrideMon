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
 * A pill with Lusion's press animations: the label rolls, and the call-to-action floods blue.
 * An arrow stands where Lusion has a dot (D-029).
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
        {variant === 'callToAction' && (
          <>
            {isInteractive && (
              <FloodingCircle pressProgress={pressProgress} pillWidth={pillWidth} />
            )}
            {!isLoading && (
              <View style={styles.leadingArrow}>
                <PressArrow
                  pressProgress={pressProgress}
                  color={isInteractive ? colors.textPrimary : colors.textPlaceholder}
                  pressedColor={isInteractive ? colors.textOnPrimary : colors.textPlaceholder}
                />
              </View>
            )}
          </>
        )}
        {isLoading ? (
          <ActivityIndicator color={variantColors.label} />
        ) : (
          <RollingLabel label={label} color={labelColor} pressProgress={pressProgress} />
        )}
        {variant !== 'callToAction' && !isLoading && (
          <PressArrow
            pressProgress={pressProgress}
            color={isInteractive ? variantColors.label : colors.textPlaceholder}
            pressedColor={isInteractive ? variantColors.pressedLabel : colors.textPlaceholder}
          />
        )}
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

/**
 * The arrow that stands in for Lusion's dot. It nudges right while pressed and, on the
 * call-to-action, turns white as the blue flood reaches it (two arrows cross-fade).
 */
function PressArrow({
  pressProgress,
  color,
  pressedColor,
}: {
  pressProgress: Animated.Value
  color: string
  pressedColor: string
}) {
  const translateX = pressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, spacing.extraSmall],
  })
  const pressedOpacity = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
  return (
    <Animated.View style={[styles.arrow, { transform: [{ translateX }] }]}>
      <Icon name="arrowRight" color={color} />
      {pressedColor !== color && (
        <Animated.View style={[styles.arrowPressed, { opacity: pressedOpacity }]}>
          <Icon name="arrowRight" color={pressedColor} />
        </Animated.View>
      )}
    </Animated.View>
  )
}

/** Interaction 2 (fill): a blue circle grows from behind the arrow until it floods the pill. */
function FloodingCircle({
  pressProgress,
  pillWidth,
}: {
  pressProgress: Animated.Value
  pillWidth: number
}) {
  // Big enough that the circle, centered near the left edge, covers the far end of the pill.
  const floodScale = Math.max((2 * pillWidth) / layout.iconSize, 1)
  const scale = pressProgress.interpolate({ inputRange: [0, 1], outputRange: [0, floodScale] })
  return <Animated.View style={[styles.floodingCircle, { transform: [{ scale }] }]} />
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
  arrowPressed: {
    ...StyleSheet.absoluteFill,
  },
  leadingArrow: {
    position: 'absolute',
    left: spacing.large,
  },
  floodingCircle: {
    position: 'absolute',
    left: spacing.large,
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
})
