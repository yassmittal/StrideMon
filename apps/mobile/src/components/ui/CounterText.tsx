import { useEffect, useRef } from 'react'
import { Animated, type StyleProp, StyleSheet, Text, type TextStyle, View } from 'react-native'
import { colors, fontFamilies, motion, textStyles } from '../../theme'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

type CounterTextSize = 'title' | 'heading' | 'counter' | 'display' | 'displayHuge'

type CounterTextProps = {
  /** Already formatted, e.g. "12.5 SOLE" or "50%". Only the digits roll. */
  value: string
  size?: CounterTextSize
  tone?: 'light' | 'dark'
  accessibilityLabel?: string
}

/**
 * design-system.md §8: a number in IBM Plex Mono where each digit rolls vertically
 * to its new value, like Lusion's preloader. Used for SOLE, live stats and progress.
 */
export function CounterText({
  value,
  size = 'counter',
  tone = 'light',
  accessibilityLabel,
}: CounterTextProps) {
  const textStyle: StyleProp<TextStyle> = [
    styles.text,
    sizeStyles[size],
    styles.mono,
    tone === 'dark' && styles.textOnDark,
  ]
  const slotHeight = sizeStyles[size].lineHeight ?? 0
  const characters = [...value]

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? value}
    >
      {characters.map((character, characterIndex) => {
        // Keyed from the right, so "9.9" → "10.0" keeps the decimals in their slots.
        const slotKey = characters.length - characterIndex
        const digit = DIGITS.indexOf(character as (typeof DIGITS)[number])
        return digit === -1 ? (
          <Text key={slotKey} style={textStyle}>
            {character}
          </Text>
        ) : (
          <DigitSlot key={slotKey} digit={digit} slotHeight={slotHeight} textStyle={textStyle} />
        )
      })}
    </View>
  )
}

function DigitSlot({
  digit,
  slotHeight,
  textStyle,
}: {
  digit: number
  slotHeight: number
  textStyle: StyleProp<TextStyle>
}) {
  const translateY = useRef(new Animated.Value(-digit * slotHeight)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -digit * slotHeight,
      duration: motion.durationMedium,
      easing: motion.easingStandard,
      useNativeDriver: true,
    }).start()
  }, [translateY, digit, slotHeight])

  return (
    <View style={[styles.slot, { height: slotHeight }]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {DIGITS.map((digitCharacter) => (
          <Text key={digitCharacter} style={[textStyle, { height: slotHeight }]}>
            {digitCharacter}
          </Text>
        ))}
      </Animated.View>
    </View>
  )
}

const sizeStyles = StyleSheet.create({
  title: textStyles.title,
  heading: textStyles.heading,
  counter: textStyles.counter,
  display: textStyles.display,
  displayHuge: textStyles.displayHuge,
})

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  slot: {
    overflow: 'hidden',
  },
  text: {
    color: colors.textPrimary,
  },
  // After the size, which brings Satoshi: every number is mono.
  mono: {
    fontFamily: fontFamilies.monoRegular,
    letterSpacing: 0,
  },
  textOnDark: {
    color: colors.textOnDark,
  },
})
