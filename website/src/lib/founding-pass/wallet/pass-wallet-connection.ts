// The wallet, for minting a Founding Pass (D-041, D-045): Reown AppKit for web with its wagmi
// adapter, on Monad Testnet. This module is loaded only after someone taps "Get ready" or "Mint"
// (`use-pass-wallet.ts`), so the gallery never downloads it.

import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { disconnect, getAccount, signMessage, switchChain, watchAccount } from '@wagmi/core'
import { defineChain } from 'viem'
import { monadTestnet as viemMonadTestnet } from 'viem/chains'
import { monadTestnetChainId } from '@/content/contracts'
import { monadPublicRpcUrl, reownProjectId, siteName, siteUrl } from '@/content/site'

/** How long a wallet from an earlier visit gets to reconnect before we treat it as gone. */
const RECONNECT_WAIT_MILLISECONDS = 5000

export type PassWalletAccount = {
  walletAddress: `0x${string}`
  chainId: number
}

/**
 * Monad Testnet as wallets should know it: always the public RPC, even when a local run reads
 * from its own Anvil, so "Add Monad Testnet" never puts a laptop's address into someone's wallet.
 */
const monadTestnet = defineChain({
  ...viemMonadTestnet,
  rpcUrls: { default: { http: [monadPublicRpcUrl] } },
  blockExplorers: { default: { name: 'MonadVision', url: 'https://testnet.monadvision.com' } },
})

const wagmiAdapter = new WagmiAdapter({
  projectId: reownProjectId,
  networks: [monadTestnet],
})

// AppKit reuses a `<w3m-modal>` that's already in the page. Ours sits in a modal <dialog> of its
// own, so it opens above the pass sheet (also a modal <dialog>) instead of behind it, where the
// sheet would make it impossible to tap.
const walletLayer = createWalletLayer()

const appKit = createAppKit({
  projectId: reownProjectId,
  adapters: [wagmiAdapter],
  networks: [monadTestnet],
  defaultNetwork: monadTestnet,
  metadata: {
    name: siteName,
    description: 'Mint a free Founding Pass.',
    url: siteUrl,
    icons: [`${siteUrl}/icon.svg`],
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#2b2e3a',
    '--w3m-font-family': 'Satoshi, "Satoshi Fallback", ui-sans-serif, system-ui, sans-serif',
    '--w3m-border-radius-master': '2px',
  },
  // External wallets only, as in the app (D-010): no email or social wallets, swaps or on-ramp.
  features: {
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    send: false,
    history: false,
    analytics: false,
  },
  // Our own network step says what's wrong in plain words (D-045), so AppKit doesn't step in.
  allowUnsupportedChain: true,
  enableNetworkSwitch: false,
})

appKit.subscribeState((modalState) => {
  if (modalState.open && !walletLayer.open) walletLayer.showModal()
  if (!modalState.open && walletLayer.open) walletLayer.close()
})

function createWalletLayer(): HTMLDialogElement {
  const dialog = document.createElement('dialog')
  dialog.className = 'wallet-layer'
  dialog.setAttribute('aria-label', 'Connect a wallet')
  dialog.append(document.createElement('w3m-modal'))
  // Escape closes AppKit, which then closes this layer.
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    void appKit.close()
  })
  document.body.append(dialog)
  return dialog
}

export function readPassWalletAccount(): PassWalletAccount | null {
  const account = getAccount(wagmiAdapter.wagmiConfig)
  if (account.status !== 'connected') return null
  return { walletAddress: account.address, chainId: account.chainId }
}

export function subscribeToPassWalletAccount(
  onChange: (account: PassWalletAccount | null) => void,
): () => void {
  return watchAccount(wagmiAdapter.wagmiConfig, {
    onChange: () => onChange(readPassWalletAccount()),
  })
}

/**
 * Waits until AppKit has started and wagmi has finished restoring a wallet from an earlier visit,
 * so the account read next is the real one, not a reconnect still under way.
 */
export async function waitForPassWalletToSettle(): Promise<void> {
  await appKit.ready()
  await new Promise<void>((resolve) => {
    const isSettled = () => {
      const { status } = getAccount(wagmiAdapter.wagmiConfig)
      return status === 'connected' || status === 'disconnected'
    }
    if (isSettled()) {
      resolve()
      return
    }
    const timeoutId = window.setTimeout(finish, RECONNECT_WAIT_MILLISECONDS)
    const unwatch = watchAccount(wagmiAdapter.wagmiConfig, {
      onChange: () => {
        if (isSettled()) finish()
      },
    })
    function finish() {
      window.clearTimeout(timeoutId)
      unwatch()
      resolve()
    }
  })
}

/** AppKit's list of wallets. Resolves once it has opened and closed again, connected or not. */
export async function openWalletPicker(): Promise<void> {
  await waitForPassWalletToSettle()
  await new Promise<void>((resolve) => {
    let hasOpened = false
    const unsubscribe = appKit.subscribeState((modalState) => {
      if (modalState.open) {
        hasOpened = true
        return
      }
      if (!hasOpened) return
      unsubscribe()
      resolve()
    })
    appKit.open({ view: 'Connect' }).catch(() => {
      unsubscribe()
      resolve()
    })
  })
  await waitForPassWalletToSettle()
}

/** Switches the wallet to Monad Testnet, adding it first if the wallet doesn't have it. */
export async function switchPassWalletToMonad(): Promise<void> {
  await switchChain(wagmiAdapter.wagmiConfig, {
    chainId: monadTestnetChainId,
    addEthereumChainParameter: {
      chainName: monadTestnet.name,
      nativeCurrency: monadTestnet.nativeCurrency,
      rpcUrls: [monadPublicRpcUrl],
      blockExplorerUrls: ['https://testnet.monadvision.com'],
    },
  })
}

/** The free sign-in message (SIWE). Nothing is sent on-chain. */
export function signPassWalletMessage(message: string): Promise<`0x${string}`> {
  return signMessage(wagmiAdapter.wagmiConfig, { message })
}

export async function disconnectPassWallet(): Promise<void> {
  await disconnect(wagmiAdapter.wagmiConfig)
}
