import { Linking, Pressable, StyleSheet, Text } from 'react-native'
import { colors, fontFamilies, MINIMUM_TOUCH_TARGET_SIZE, textStyles } from '../../theme'

// Feedback that the press registered, without a background to flash.
const PRESSED_OPACITY = 0.6

type ExternalLinkProps = {
  label: string
  url: string
  /** When the visible label alone is ambiguous, such as "View" next to a list item. */
  accessibilityLabel?: string
  /** `onDark` on a dark panel or screen. */
  tone?: 'default' | 'onDark'
}

/** Opens a web page (the block explorer) in the phone's browser. */
export function ExternalLink({
  label,
  url,
  accessibilityLabel,
  tone = 'default',
}: ExternalLinkProps) {
  function handlePress() {
    Linking.openURL(url).catch((error: unknown) => {
      console.warn('Opening the link failed', url, error)
    })
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint="Opens in your browser"
      onPress={handlePress}
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
    >
      <Text style={[styles.label, tone === 'onDark' && styles.labelOnDark]}>{label} ↗</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  link: {
    minHeight: MINIMUM_TOUCH_TARGET_SIZE,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  linkPressed: {
    opacity: PRESSED_OPACITY,
  },
  label: {
    ...textStyles.caption,
    fontFamily: fontFamilies.medium,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  labelOnDark: {
    color: colors.textOnDark,
  },
})
