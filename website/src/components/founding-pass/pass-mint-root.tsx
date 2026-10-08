'use client'

import { useEffect } from 'react'
import { resumePassMintInProgress } from '@/lib/founding-pass/pass-mint-flow'
import { checkHeldFoundingPass } from '@/lib/founding-pass/pass-mint-readiness'
import { PassMintDialog } from './pass-mint-dialog'
import { PassWalletLoader } from './pass-wallet-loader'

/**
 * Once per page that can mint (/pass and each pass page): the mint dialog, the wallet code when
 * it's asked for, and, for a returning visitor, their pass and any mint still going (D-045).
 */
export function PassMintRoot() {
  useEffect(() => {
    void checkHeldFoundingPass()
    resumePassMintInProgress()
  }, [])
  return (
    <>
      <PassMintDialog />
      <PassWalletLoader />
    </>
  )
}
