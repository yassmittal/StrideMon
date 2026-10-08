'use client'

import dynamic from 'next/dynamic'
import { failPassWalletLoad, usePassWallet } from '@/lib/founding-pass/use-pass-wallet'

function MissingWalletBridge() {
  return null
}

// `ssr: false`: the wallet code is for the browser only, and it doesn't build for the server
// (D-045). It's downloaded the first time someone asks for the wallet.
const PassWalletBridge = dynamic(
  () =>
    import('@/lib/founding-pass/wallet/pass-wallet-bridge')
      .then((bridgeModule) => bridgeModule.PassWalletBridge)
      .catch(() => {
        failPassWalletLoad()
        return MissingWalletBridge
      }),
  { ssr: false },
)

/** Loads the wallet code once something asks for it (`requestPassWallet`). */
export function PassWalletLoader() {
  const { loadStatus } = usePassWallet()
  return loadStatus === 'idle' ? null : <PassWalletBridge />
}
