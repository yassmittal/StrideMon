// Must load before WalletConnect: it polyfills crypto.getRandomValues, TextEncoder and URL.
import '@walletconnect/react-native-compat'

import { createAppKit } from '@reown/appkit-react-native'
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native'
import { appEnvironment } from '../../config/env'
import { appKitStorage } from './app-kit-storage'
import { monadChain } from './monad-chain'

const APP_METADATA = {
  name: 'StrideMon',
  description: 'Walk. Earn. Upgrade your Sneaker.',
  url: 'https://stridemon.xyz',
  icons: [],
  // After the player approves in their wallet, the wallet sends them back here.
  redirect: { native: 'stridemon://' },
}

export const wagmiAdapter = new WagmiAdapter({
  projectId: appEnvironment.reownProjectId,
  networks: [monadChain],
})

export const appKit = createAppKit({
  projectId: appEnvironment.reownProjectId,
  metadata: APP_METADATA,
  adapters: [wagmiAdapter],
  networks: [monadChain],
  defaultNetwork: monadChain,
  storage: appKitStorage,
  // External wallets only (D-010): no email/social embedded wallets, swaps or on-ramp.
  features: { socials: false, swaps: false, onramp: false },
  enableAnalytics: false,
})
