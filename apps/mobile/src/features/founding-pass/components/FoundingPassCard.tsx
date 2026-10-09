import { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { colors, fontFamilies, motion, radii } from '../../../theme'

type FoundingPassCardProps = {
  /** `FoundingPass.imageSvg`, or `undefined` while it loads. */
  imageSvg: string | undefined
  accessibilityLabel: string
}

/**
 * The pass's on-chain card, square, like `SneakerArt` (D-046). It fades in when it arrives and
 * again when it changes, so lacing visibly redraws it.
 */
export function FoundingPassCard({ imageSvg, accessibilityLabel }: FoundingPassCardProps) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (imageSvg === undefined) return
    opacity.setValue(0)
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.durationMedium,
      easing: motion.easingStandard,
      useNativeDriver: true,
    }).start()
  }, [imageSvg, opacity])

  return (
    <View
      style={styles.frame}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {imageSvg === undefined ? (
        <View style={styles.placeholder}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      ) : (
        <Animated.View style={[styles.fill, { opacity }]}>
          {/* The card's text asks for IBM Plex Mono, which the app bundles. */}
          <SvgXml
            xml={imageSvg}
            width="100%"
            height="100%"
            font={{ fontFamily: fontFamilies.monoRegular }}
          />
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.medium,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  fill: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
