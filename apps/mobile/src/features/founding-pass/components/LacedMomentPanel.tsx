import { StyleSheet, Text, View } from 'react-native'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { colors, spacing, textStyles } from '../../../theme'
import type { HeldFoundingPass } from '../hooks/useFoundingPass'
import { formatPassNumber } from '../pass-number'
import { FoundingPassCard } from './FoundingPassCard'

type LacedMomentPanelProps = {
  foundingPass: HeldFoundingPass
  /** The laced card, or `undefined` while it loads. */
  imageSvg: string | undefined
}

/** The first settled walk laced the pass and its Founder Sneaker (D-041): a quiet moment. */
export function LacedMomentPanel({ foundingPass, imageSvg }: LacedMomentPanelProps) {
  const passNumber = formatPassNumber(foundingPass.designNumber)
  return (
    <Panel>
      <View style={styles.content} accessibilityLiveRegion="polite">
        <MetaLabel items={['Founding Pass', passNumber, 'Laced']} />
        <Text style={styles.title} accessibilityRole="header">
          Your shoe is laced
        </Text>
        <Text style={styles.body}>
          Your first walk laced your Founding Pass and your Founder Sneaker. Both pictures changed
          on Monad, for good.
        </Text>
        <FoundingPassCard
          imageSvg={imageSvg}
          accessibilityLabel={`Founding Pass ${passNumber}, laced`}
        />
      </View>
    </Panel>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.medium,
  },
  title: {
    ...textStyles.title,
    color: colors.textPrimary,
  },
  body: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
})
