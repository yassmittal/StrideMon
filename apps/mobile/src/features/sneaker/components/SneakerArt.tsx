import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { Icon } from '../../../components/ui/Icon'
import { colors, fontFamilies, layout, motion } from '../../../theme'

type SneakerArtProps = {
  /** The on-chain SVG, or `undefined` while it loads (or if it couldn't be read). */
  imageSvg: string | undefined
  accessibilityLabel: string
}

/**
 * The Sneaker's on-chain picture (D-030), square, on the hero panel's dark surface. It fades
 * in when it arrives and again when it changes, so a repair or upgrade visibly redraws it.
 */
export function SneakerArt({ imageSvg, accessibilityLabel }: SneakerArtProps) {
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
          <Icon
            name="sneaker"
            color={colors.textOnDarkMuted}
            size={layout.sneakerArtPlaceholderIconSize}
          />
        </View>
      ) : (
        <Animated.View style={[styles.fill, { opacity }]}>
          {/* Wallets get a generic monospace; in the app the art's text uses IBM Plex Mono. */}
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
