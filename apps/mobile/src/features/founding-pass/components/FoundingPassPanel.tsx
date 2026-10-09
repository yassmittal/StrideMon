import { FOUNDING_PASS_DESIGN_COUNT } from '@stridemon/shared/domain'
import { StyleSheet, Text, View } from 'react-native'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { buildFoundingPassPageUrl } from '../../../config/website-urls'
import { colors, spacing, textStyles } from '../../../theme'
import type { HeldFoundingPass } from '../hooks/useFoundingPass'
import { formatPassNumber } from '../pass-number'
import { FoundingPassCard } from './FoundingPassCard'

type FoundingPassPanelProps = {
  foundingPass: HeldFoundingPass
  /** `FoundingPass.imageSvg`, or `undefined` while it loads. */
  imageSvg: string | undefined
}

/** Profile's pass (D-046): the on-chain card, the founder number, laced or not, and its page. */
export function FoundingPassPanel({ foundingPass, imageSvg }: FoundingPassPanelProps) {
  const passNumber = formatPassNumber(foundingPass.designNumber)
  const metaItems = ['Founding Pass', passNumber]
  if (foundingPass.hasGoldFrame) metaItems.push('Gold frame')

  return (
    <Panel>
      <View style={styles.content}>
        <MetaLabel items={metaItems} />
        <FoundingPassCard
          imageSvg={imageSvg}
          accessibilityLabel={`Founding Pass ${passNumber}, founder ${foundingPass.founderNumber}, ${foundingPass.isLaced ? 'laced' : 'not laced yet'}`}
        />
        <Text style={styles.title}>
          Founder {foundingPass.founderNumber} of{' '}
          {FOUNDING_PASS_DESIGN_COUNT.toLocaleString('en-US')}
        </Text>
        <Text style={styles.body}>
          {foundingPass.isLaced
            ? 'Laced. Your first walk laced this pass and your Founder Sneaker.'
            : 'Not laced yet. Your first walk laces this pass and your Founder Sneaker.'}
        </Text>
        <Text style={styles.caption}>Free. It can’t be sent or sold.</Text>
        <ExternalLink
          label="See it on stridemon.xyz"
          accessibilityLabel={`See Founding Pass ${passNumber} on stridemon.xyz`}
          url={buildFoundingPassPageUrl(foundingPass.designNumber)}
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
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
})
