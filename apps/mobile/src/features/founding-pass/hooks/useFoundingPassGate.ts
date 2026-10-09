import { useEffect, useState } from 'react'
import { useFoundingPass } from './useFoundingPass'
import { useFoundingPassSchedule } from './useFoundingPassSchedule'

// Someone may be minting on the website right now; a pass shows up a few seconds after.
const PASS_POLL_INTERVAL_MILLISECONDS = 5_000

/** What "I've minted my pass" is doing. */
export type PassCheck = 'idle' | 'checking' | 'notFound'

/**
 * The gate screen's state (D-046): the mint's schedule, a pass check the player can start, and a
 * poll for the pass. Home leaves the gate by itself once the chain shows a pass. When the
 * collection says the gate is off (opening day), it asks for the free Sneaker again.
 */
export function useFoundingPassGate({
  walletAddress,
  requestStarterSneakerAgain,
}: {
  walletAddress: string
  requestStarterSneakerAgain: () => void
}) {
  const scheduleQuery = useFoundingPassSchedule()
  const { refetch: refetchFoundingPass } = useFoundingPass(walletAddress, {
    passPollIntervalMilliseconds: PASS_POLL_INTERVAL_MILLISECONDS,
  })
  const [passCheck, setPassCheck] = useState<PassCheck>('idle')

  const isEarlyAccessGateOn = scheduleQuery.data?.isEarlyAccessGateOn
  useEffect(() => {
    if (isEarlyAccessGateOn === false) requestStarterSneakerAgain()
  }, [isEarlyAccessGateOn, requestStarterSneakerAgain])

  async function checkForPass() {
    setPassCheck('checking')
    try {
      await refetchFoundingPass()
    } finally {
      // With a pass, Home has already moved on and this screen is gone.
      setPassCheck('notFound')
    }
  }

  return { scheduleQuery, passCheck, checkForPass }
}
