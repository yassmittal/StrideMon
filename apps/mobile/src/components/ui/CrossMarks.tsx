import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, layout, spacing, textStyles } from '../../theme'

type CrossMarksProps = {
  /** Sits between the top two marks, like Lusion's `SCROLL TO EXPLORE`. */
  caption: string
  children: ReactNode
  tone?: 'light' | 'dark'
}

/** design-system.md §8: "+" marks at the four corners of a block, with a caption between the top two. */
export function CrossMarks({ caption, children, tone = 'light' }: CrossMarksProps) {
  return (
    <View style={styles.frame}>
      <View style={styles.markRow}>
        <CrossMark />
        <Text style={[styles.caption, tone === 'dark' && styles.captionOnDark]}>{caption}</Text>
        <CrossMark />
      </View>
      <View style={styles.content}>{children}</View>
      <View style={styles.markRow}>
        <CrossMark />
        <CrossMark />
      </View>
    </View>
  )
}

function CrossMark() {
  return (
    <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.markHorizontal} />
      <View style={styles.markVertical} />
    </View>
  )
}

const MARK_STROKE_OFFSET = (layout.crossMarkSize - layout.crossMarkStrokeWidth) / 2

const styles = StyleSheet.create({
  frame: {
    gap: spacing.medium,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mark: {
    width: layout.crossMarkSize,
    height: layout.crossMarkSize,
  },
  markHorizontal: {
    position: 'absolute',
    top: MARK_STROKE_OFFSET,
    width: layout.crossMarkSize,
    height: layout.crossMarkStrokeWidth,
    backgroundColor: colors.crossMark,
  },
  markVertical: {
    position: 'absolute',
    left: MARK_STROKE_OFFSET,
    width: layout.crossMarkStrokeWidth,
    height: layout.crossMarkSize,
    backgroundColor: colors.crossMark,
  },
  caption: {
    ...textStyles.button,
    flexShrink: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  captionOnDark: {
    color: colors.textOnDark,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: layout.crossMarkSize,
  },
})
