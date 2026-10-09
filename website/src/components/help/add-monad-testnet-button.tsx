'use client'

import { useState } from 'react'
import { monadTestnetChainId } from '@/content/contracts'
import { helpNetworkSetupContent } from '@/content/help'
import { monadPublicRpcUrl } from '@/content/site'
import { buildPillClassName, PillContent } from '../ui/pill-button'

type InjectedWallet = {
  request: (request: { method: string; params?: readonly unknown[] }) => Promise<unknown>
}

type AddNetworkState = 'idle' | 'adding' | 'added' | 'refused' | 'failed' | 'noWallet'

// EIP-1193's "the user rejected the request".
const USER_REJECTED_REQUEST_CODE = 4001

/**
 * One tap to add Monad Testnet (D-047), where the browser has a wallet: the MetaMask extension, or
 * MetaMask's own browser on a phone. It loads no wallet library. Without a wallet it says so, and
 * the details to add by hand sit right below.
 */
export function AddMonadTestnetButton() {
  const [addNetworkState, setAddNetworkState] = useState<AddNetworkState>('idle')

  async function addMonadTestnet() {
    const injectedWallet = (window as Window & { ethereum?: InjectedWallet }).ethereum
    if (injectedWallet === undefined) {
      setAddNetworkState('noWallet')
      return
    }
    setAddNetworkState('adding')
    try {
      await injectedWallet.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${monadTestnetChainId.toString(16)}`,
            chainName: 'Monad Testnet',
            nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
            rpcUrls: [monadPublicRpcUrl],
            blockExplorerUrls: ['https://testnet.monadvision.com'],
          },
        ],
      })
      setAddNetworkState('added')
    } catch (error) {
      const isRefused =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === USER_REJECTED_REQUEST_CODE
      setAddNetworkState(isRefused ? 'refused' : 'failed')
    }
  }

  const resultText = readResultText(addNetworkState)
  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={addMonadTestnet}
        disabled={addNetworkState === 'adding'}
        className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
      >
        <PillContent
          label={
            addNetworkState === 'adding'
              ? helpNetworkSetupContent.addingLabel
              : helpNetworkSetupContent.addLabel
          }
        />
      </button>
      <p aria-live="polite" className="text-base leading-[1.45] text-ink-secondary-small">
        {resultText}
      </p>
    </div>
  )
}

function readResultText(addNetworkState: AddNetworkState): string {
  switch (addNetworkState) {
    case 'idle':
    case 'adding':
      return ''
    case 'added':
      return helpNetworkSetupContent.addedText
    case 'refused':
      return helpNetworkSetupContent.refusedText
    case 'failed':
      return helpNetworkSetupContent.failedText
    case 'noWallet':
      return helpNetworkSetupContent.noWalletText
    default: {
      const unhandledState: never = addNetworkState
      throw new Error(`Unhandled add-network state: ${String(unhandledState)}`)
    }
  }
}
