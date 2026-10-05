import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { colors, fontFamilies, layout, motion, radii, spacing, textStyles } from '../../theme'

type ProgressBarProps = {
  label: string
  value: number
  maximum: number
  /** `dark` on a dark panel: Lusion's lime fill on a grey track. */
  tone?: 'light' | 'dark'
}

/** A labelled bar with `value / maximum` on the right. Used for energy and durability. */
export function ProgressBar({ label, value, maximum, tone = 'light' }: ProgressBarProps) {
  const filledFraction = maximum > 0 ? Math.min(Math.max(value / maximum, 0), 1) : 0
  const animatedFraction = useRef(new Animated.Value(filledFraction)).current
  const shownFraction = useRef(filledFraction)

  useEffect(() => {
    // The bar mounts already filled; it only animates when the value changes.
    if (shownFraction.current === filledFraction) return
    shownFraction.current = filledFraction
    Animated.timing(animatedFraction, {
      toValue: filledFraction,
      duration: motion.durationSlow,
      easing: motion.easingEmphasized,
      useNativeDriver: false,
    }).start()
  }, [animatedFraction, filledFraction])

  const isDark = tone === 'dark'
  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: maximum, now: value, text: `${value} of ${maximum}` }}
    >
      <View style={styles.header}>
        <Text style={[styles.label, isDark && styles.textOnDark]}>{label}</Text>
        <Text style={[styles.value, isDark && styles.textOnDark]}>
          {value} / {maximum}
        </Text>
      </View>
      <View style={[styles.track, isDark && styles.trackOnDark]}>
        <Animated.View
          style={[
            styles.fill,
            isDark && styles.fillOnDark,
            {
              width: animatedFraction.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    ...textStyles.caption,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  value: {
    ...textStyles.caption,
    fontFamily: fontFamilies.monoRegular,
    color: colors.textPrimary,
  },
  textOnDark: {
    color: colors.textOnDark,
  },
  track: {
    height: layout.progressTrackHeight,
    borderRadius: radii.tiny,
    backgroundColor: colors.overlayOnLight,
    overflow: 'hidden',
  },
  trackOnDark: {
    backgroundColor: colors.darkTrack,
  },
  fill: {
    height: '100%',
    borderRadius: radii.tiny,
    backgroundColor: colors.textPrimary,
  },
  fillOnDark: {
    backgroundColor: colors.highlight,
  },
})
