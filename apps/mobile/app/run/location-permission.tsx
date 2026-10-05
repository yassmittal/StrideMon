import { router, useLocalSearchParams } from 'expo-router'
import { Linking } from 'react-native'
import { ErrorState } from '../../src/components/ui/ErrorState'
import { LoadingScreen } from '../../src/components/ui/LoadingScreen'
import { Screen } from '../../src/components/ui/Screen'
import { LocationPermissionExplainer } from '../../src/features/activity-session/components/LocationPermissionExplainer'
import { useStartRunAfterPermission } from '../../src/features/activity-session/hooks/useStartRunAfterPermission'

const WHOLE_NUMBER_PATTERN = /^\d+$/

/** The explainer before the OS location prompt, opened by START on Home. */
export default function LocationPermissionScreen() {
  const { sneakerTokenId, efficiency } = useLocalSearchParams<{
    sneakerTokenId: string
    efficiency: string
  }>()

  if (
    !WHOLE_NUMBER_PATTERN.test(sneakerTokenId ?? '') ||
    !WHOLE_NUMBER_PATTERN.test(efficiency ?? '')
  ) {
    return (
      <Screen>
        <ErrorState
          message="Couldn’t tell which Sneaker to run with. Go back and press START again."
          retryLabel="Back to Home"
          onRetryPress={() => router.back()}
        />
      </Screen>
    )
  }
  return (
    <PermissionThenRun sneakerTokenId={BigInt(sneakerTokenId)} efficiency={Number(efficiency)} />
  )
}

function PermissionThenRun({
  sneakerTokenId,
  efficiency,
}: {
  sneakerTokenId: bigint
  efficiency: number
}) {
  const { permissionState, continueToRun, isBusy, errorMessage } = useStartRunAfterPermission({
    sneakerTokenId,
    efficiency,
  })

  if (permissionState === 'checking') {
    return <LoadingScreen accessibilityLabel="Checking location access" />
  }
  return (
    <Screen isScrollable>
      <LocationPermissionExplainer
        permissionState={permissionState}
        onContinuePress={continueToRun}
        onOpenSettingsPress={() => void Linking.openSettings()}
        onNotNowPress={() => router.back()}
        isBusy={isBusy}
        errorMessage={errorMessage}
      />
    </Screen>
  )
}
