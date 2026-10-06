import { StyleSheet, Text } from 'react-native'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { colors, textStyles } from '../../../theme'

/** Shown while `SneakerGame` is paused (D-032): what's off, and that nothing is lost. */
export function MaintenanceNotice() {
  return (
    <Panel>
      <MetaLabel items={['Maintenance']} />
      <Text style={styles.body} accessibilityRole="alert">
        StrideMon is paused for a short while. Your Sneaker and STRIDE are safe, and runs, repairs
        and upgrades are back soon.
      </Text>
    </Panel>
  )
}

const styles = StyleSheet.create({
  body: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
})
