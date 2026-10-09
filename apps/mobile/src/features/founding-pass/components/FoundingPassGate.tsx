import type { FoundingPassCollectionResponse } from '@stridemon/shared/api-contracts'
import { FOUNDING_PASS_DESIGN_COUNT } from '@stridemon/shared/domain'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { Button } from '../../../components/ui/Button'
import { ExternalLink } from '../../../components/ui/ExternalLink'
import { MetaLabel } from '../../../components/ui/MetaLabel'
import { Panel } from '../../../components/ui/Panel'
import { buildHelpUrl, foundingPassGalleryUrl } from '../../../config/website-urls'
import { colors, fontFamilies, spacing, textStyles } from '../../../theme'
import { describeMintPhase, describeOpeningDay } from '../founding-pass-gate-copy'
import type { PassCheck } from '../hooks/useFoundingPassGate'

type FoundingPassGateProps = {
  walletAddress: string
  /** `undefined` while it loads, or when it couldn't load (`isCollectionUnavailable`). */
  collection: FoundingPassCollectionResponse | undefined
  isCollectionUnavailable: boolean
  passCheck: PassCheck
  onCheckForPassPress: () => void
  onSignOutPress: () => void
  isSigningOut: boolean
}

/**
 * Early access is on and this wallet has no pass (D-041, D-046). It says how to get in, where the
 * mint is, when the app opens to everyone, and, the likeliest place to get stuck, which wallet is
 * signed in.
 */
export function FoundingPassGate({
  walletAddress,
  collection,
  isCollectionUnavailable,
  passCheck,
  onCheckForPassPress,
  onSignOutPress,
  isSigningOut,
}: FoundingPassGateProps) {
  function openGallery() {
    Linking.openURL(foundingPassGalleryUrl).catch((error: unknown) => {
      console.warn('Opening the Founding Pass gallery failed', error)
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MetaLabel items={['Early access', 'Monad testnet']} />
        <Text style={styles.title} accessibilityRole="header">
          Mint a Founding Pass to get in early
        </Text>
        <Text style={styles.body}>
          StrideMon opens with {FOUNDING_PASS_DESIGN_COUNT.toLocaleString('en-US')} Founding Passes,
          each a one-of-one design. A pass is free, and it can’t be sent or sold. It gets you in
          now, with a Founder Sneaker drawn in its design.
        </Text>
      </View>

      <Panel>
        <View style={styles.section}>
          <MetaLabel items={['The mint']} />
          <MintSchedule collection={collection} isCollectionUnavailable={isCollectionUnavailable} />
        </View>
      </Panel>

      <Button label="See the Founding Passes" onPress={openGallery} />

      <Panel>
        <View style={styles.section}>
          <MetaLabel items={['Signed in as']} />
          <Text
            style={styles.walletAddress}
            selectable
            accessibilityLabel={`Wallet ${walletAddress}`}
          >
            {walletAddress}
          </Text>
          <Text style={styles.body}>
            Minted with another wallet? Sign out and sign in with that one.
          </Text>
          <PassCheckFeedback passCheck={passCheck} />
          <Button
            label="I’ve minted my pass"
            variant="secondary"
            onPress={onCheckForPassPress}
            isLoading={passCheck === 'checking'}
          />
          <Button
            label="Sign out"
            variant="secondary"
            onPress={onSignOutPress}
            isLoading={isSigningOut}
          />
        </View>
      </Panel>

      <ExternalLink label="Get help" url={buildHelpUrl('app-no-pass')} />
    </View>
  )
}

function MintSchedule({
  collection,
  isCollectionUnavailable,
}: Pick<FoundingPassGateProps, 'collection' | 'isCollectionUnavailable'>) {
  if (collection === undefined) {
    return (
      <Text style={styles.body}>
        {isCollectionUnavailable
          ? 'Couldn’t load the mint dates just now. They’re on the Founding Pass page.'
          : 'Loading the mint dates…'}
      </Text>
    )
  }
  const mintProgress = {
    schedule: collection.schedule,
    mintedCount: collection.mintedCount,
    designCount: collection.designCount,
  }
  const isGateClosing =
    collection.schedule.phase === 'allMinted' || collection.schedule.phase === 'openToAll'
  return (
    <>
      <Text style={styles.body}>{describeMintPhase(mintProgress)}</Text>
      {!isGateClosing && <Text style={styles.caption}>{describeOpeningDay(mintProgress)}</Text>}
    </>
  )
}

function PassCheckFeedback({ passCheck }: { passCheck: PassCheck }) {
  switch (passCheck) {
    case 'idle':
      return null
    case 'checking':
      return <Text style={styles.body}>Checking for your pass…</Text>
    case 'notFound':
      return (
        <Text style={styles.notFound} accessibilityRole="alert">
          No pass in this wallet yet. A pass minted a moment ago can take a few seconds to show, so
          try again soon. Minted with another wallet? Sign out and sign in with that one.
        </Text>
      )
    default: {
      const unhandledPassCheck: never = passCheck
      throw new Error(`Unhandled pass check: ${String(unhandledPassCheck)}`)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.large,
  },
  header: {
    gap: spacing.medium,
  },
  title: {
    ...textStyles.heading,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.medium,
  },
  body: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  caption: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  walletAddress: {
    ...textStyles.body,
    fontFamily: fontFamilies.monoMedium,
    color: colors.textPrimary,
  },
  notFound: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
})
