import { router, useLocalSearchParams } from 'expo-router'
import { Button } from '../../../src/components/ui/Button'
import { ErrorState } from '../../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../../src/components/ui/LoadingScreen'
import { Screen } from '../../../src/components/ui/Screen'
import { ActivitySessionSummaryCard } from '../../../src/features/activity-session/components/ActivitySessionSummaryCard'
import { useActivitySession } from '../../../src/features/activity-session/hooks/useActivitySession'
import { useCurrentUser } from '../../../src/features/auth/hooks/useCurrentUser'
import { LacedMomentPanel } from '../../../src/features/founding-pass/components/LacedMomentPanel'
import { useFoundingPassImageSvg } from '../../../src/features/founding-pass/hooks/useFoundingPassImageSvg'
import { useLacedMoment } from '../../../src/features/founding-pass/hooks/useLacedMoment'
import { useIsGamePaused } from '../../../src/features/sneaker/hooks/useIsGamePaused'

/**
 * A finished run: settling on Monad, then the STRIDE it earned, and for a founder's first walk,
 * the laced moment (D-046). Opened after STOP and from History.
 */
export default function ActivitySessionSummaryScreen() {
  const { activitySessionId } = useLocalSearchParams<{ activitySessionId: string }>()
  const activitySessionQuery = useActivitySession(activitySessionId)
  const isGamePaused = useIsGamePaused()
  const currentUserQuery = useCurrentUser()
  const lacedFoundingPass = useLacedMoment({
    walletAddress: currentUserQuery.data?.user.walletAddress,
    isSettled: activitySessionQuery.data?.status === 'settled',
  })
  const lacedPassImageSvgQuery = useFoundingPassImageSvg(lacedFoundingPass?.passTokenId)

  if (activitySessionQuery.isError) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t load this run. Check your connection and try again."
          onRetryPress={() => activitySessionQuery.refetch()}
          isRetrying={activitySessionQuery.isRefetching}
        />
      </Screen>
    )
  }
  if (activitySessionQuery.data === undefined) {
    return <LoadingScreen accessibilityLabel="Loading your run" />
  }
  return (
    <Screen isScrollable>
      <ActivitySessionSummaryCard
        activitySession={activitySessionQuery.data}
        isGamePaused={isGamePaused}
      />
      {lacedFoundingPass !== null && (
        <LacedMomentPanel foundingPass={lacedFoundingPass} imageSvg={lacedPassImageSvgQuery.data} />
      )}
      <Button
        label="Done"
        onPress={() => (router.canGoBack() ? router.back() : router.dismissTo('/'))}
      />
    </Screen>
  )
}
