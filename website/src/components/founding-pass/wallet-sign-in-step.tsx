'use client'

import { useState } from 'react'
import { monadTestnetChainId, shortenAddress } from '@/content/contracts'
import {
  type MintProblemKey,
  mintProblemActionLabels,
  walletStepContent,
} from '@/content/founding-pass-mint'
import {
  readProblemCode,
  requestSignInMessage,
  verifySignInSignature,
} from '@/lib/founding-pass/pass-api'
import { resumePassMintInProgress } from '@/lib/founding-pass/pass-mint-flow'
import {
  checkHeldFoundingPass,
  forgetSignIn,
  saveSignIn,
  usePassMintReadiness,
} from '@/lib/founding-pass/pass-mint-readiness'
import {
  disconnectLoadedPassWallet,
  type PassWalletApi,
  requestPassWallet,
} from '@/lib/founding-pass/use-pass-wallet'
import type { PassWalletAccount } from '@/lib/founding-pass/wallet/pass-wallet-connection'
import { isWalletRejection } from '@/lib/founding-pass/wallet-errors'
import { HelpTopicLink } from '../ui/help-topic-link'
import { buildPillClassName, PillContent } from '../ui/pill-button'
import { MintProblemNote, MintTextButton } from './mint-problem-note'
import { MintStepFrame, mintQuietButtonClassName } from './mint-step-frame'

type WalletSignInStepProps = {
  headingLevel: 'h3' | 'h4'
}

type Phase = 'idle' | 'loading' | 'picking' | 'network' | 'switching' | 'signing'

/**
 * Step 2 of "Get ready" (D-045): connect a wallet (the wallet code loads now), make sure it's on
 * Monad Testnet, and sign the app's free sign-in message. The sign-in stays in this browser.
 */
export function WalletSignInStep({ headingLevel }: WalletSignInStepProps) {
  const { signIn } = usePassMintReadiness()
  const [phase, setPhase] = useState<Phase>('idle')
  const [problemKey, setProblemKey] = useState<MintProblemKey | null>(null)
  const [account, setAccount] = useState<PassWalletAccount | null>(null)
  const [walletApi, setWalletApi] = useState<PassWalletApi | null>(null)

  if (signIn !== null) {
    return (
      <MintStepFrame
        stepLabel={walletStepContent.stepLabel}
        title={walletStepContent.title}
        isDone
        headingLevel={headingLevel}
      >
        <p className="text-base leading-[1.4]">
          {walletStepContent.signedInPrefix}{' '}
          <span className="font-mono text-sm">{shortenAddress(signIn.walletAddress)}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            forgetSignIn()
            void disconnectLoadedPassWallet()
            setPhase('idle')
            setProblemKey(null)
          }}
          className={mintQuietButtonClassName}
        >
          {walletStepContent.changeWalletLabel}
        </button>
      </MintStepFrame>
    )
  }

  async function connectWallet() {
    setProblemKey(null)
    setPhase('loading')
    let loadedWalletApi: PassWalletApi
    try {
      loadedWalletApi = await requestPassWallet()
    } catch {
      setPhase('idle')
      setProblemKey('walletLoadFailed')
      return
    }
    setWalletApi(loadedWalletApi)
    setPhase('picking')
    try {
      // Always the picker: a wallet restored from an earlier visit may not be the one wanted now
      // ("Use another wallet").
      await loadedWalletApi.waitForPassWalletToSettle()
      if (loadedWalletApi.readPassWalletAccount() !== null) {
        await loadedWalletApi.disconnectPassWallet()
      }
      await loadedWalletApi.openWalletPicker()
    } catch {
      // AppKit closed on an error: the account check below says what to do.
    }
    const connectedAccount = loadedWalletApi.readPassWalletAccount()
    if (connectedAccount === null) {
      setPhase('idle')
      setProblemKey('walletNotConnected')
      return
    }
    setAccount(connectedAccount)
    if (connectedAccount.chainId !== monadTestnetChainId) {
      setPhase('network')
      return
    }
    await signInWith(loadedWalletApi, connectedAccount)
  }

  async function switchNetwork() {
    if (walletApi === null || account === null) return
    setProblemKey(null)
    setPhase('switching')
    try {
      await walletApi.switchPassWalletToMonad()
    } catch {
      setPhase('network')
      setProblemKey('networkSwitchFailed')
      return
    }
    const switchedAccount = walletApi.readPassWalletAccount() ?? account
    setAccount(switchedAccount)
    if (switchedAccount.chainId !== monadTestnetChainId) {
      setPhase('network')
      setProblemKey('networkSwitchFailed')
      return
    }
    await signInWith(walletApi, switchedAccount)
  }

  async function signInWith(loadedWalletApi: PassWalletApi, signingAccount: PassWalletAccount) {
    setProblemKey(null)
    setPhase('signing')
    const messageResult = await requestSignInMessage(signingAccount.walletAddress)
    if (!messageResult.isOk) {
      setPhase('idle')
      setProblemKey(readSignInProblemKey(readProblemCode(messageResult.problem)))
      return
    }
    let signature: `0x${string}`
    try {
      signature = await loadedWalletApi.signPassWalletMessage(messageResult.data)
    } catch (error) {
      setPhase('idle')
      setProblemKey(isWalletRejection(error) ? 'signatureRefused' : 'walletNotAnswering')
      return
    }
    const verifyResult = await verifySignInSignature(messageResult.data, signature)
    if (!verifyResult.isOk) {
      setPhase('idle')
      setProblemKey(readSignInProblemKey(readProblemCode(verifyResult.problem)))
      return
    }
    saveSignIn(verifyResult.data)
    setPhase('idle')
    void checkHeldFoundingPass()
    // A mint this browser started before the sign-in ended picks up again.
    resumePassMintInProgress()
  }

  const isBusy =
    phase === 'loading' || phase === 'picking' || phase === 'signing' || phase === 'switching'

  return (
    <MintStepFrame
      stepLabel={walletStepContent.stepLabel}
      title={walletStepContent.title}
      isDone={false}
      headingLevel={headingLevel}
    >
      <p className="text-sm leading-[1.45] text-ink-secondary-small">
        {walletStepContent.description}
      </p>

      {phase === 'network' || phase === 'switching' ? (
        <div className="flex flex-col gap-3">
          <p className="text-lg leading-[1.25]">{walletStepContent.networkHeading}</p>
          <p className="text-sm leading-[1.45] text-ink-secondary-small">
            {walletStepContent.networkText}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void switchNetwork()}
              disabled={phase === 'switching'}
              className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
            >
              <PillContent
                label={
                  phase === 'switching'
                    ? walletStepContent.switchingLabel
                    : walletStepContent.switchLabel
                }
              />
            </button>
            <HelpTopicLink helpTopicId="wrong-network" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                walletApi !== null && account !== null && problemKey !== 'walletNotConnected'
                  ? void signInWith(walletApi, walletApi.readPassWalletAccount() ?? account)
                  : void connectWallet()
              }
              disabled={isBusy}
              className={buildPillClassName('primary', 'regular', 'disabled:opacity-60')}
            >
              <PillContent label={readButtonLabel(phase, account !== null)} />
            </button>
            {account !== null ? (
              <span className="font-mono text-sm">{shortenAddress(account.walletAddress)}</span>
            ) : null}
          </div>
          {phase === 'signing' ? (
            <p aria-live="polite" className="text-sm leading-[1.45]">
              {walletStepContent.signingText}
            </p>
          ) : null}
        </div>
      )}

      <div aria-live="polite" className="empty:hidden">
        {problemKey !== null ? (
          <MintProblemNote
            problemKey={problemKey}
            extra={problemKey === 'networkSwitchFailed' ? <NetworkDetails /> : null}
            actions={
              problemKey === 'walletLoadFailed' ? (
                <MintTextButton
                  label={mintProblemActionLabels.reload}
                  onClick={() => window.location.reload()}
                />
              ) : problemKey === 'networkSwitchFailed' && walletApi !== null && account !== null ? (
                <MintTextButton
                  label={walletStepContent.signInAnywayLabel}
                  onClick={() => void signInWith(walletApi, account)}
                />
              ) : null
            }
          />
        ) : null}
      </div>
    </MintStepFrame>
  )
}

function readButtonLabel(phase: Phase, hasAccount: boolean): string {
  if (phase === 'loading' || phase === 'picking') return walletStepContent.loadingLabel
  if (phase === 'signing') return walletStepContent.signingLabel
  return hasAccount ? walletStepContent.signInLabel : walletStepContent.connectLabel
}

function readSignInProblemKey(problemCode: string | null): MintProblemKey {
  switch (problemCode) {
    case 'NONCE_EXPIRED':
      return 'signInRequestExpired'
    case 'INVALID_SIGNATURE':
      return 'signatureInvalid'
    case 'RATE_LIMITED':
      return 'rateLimited'
    case null:
      return 'unreachable'
    default:
      return 'unexpected'
  }
}

function NetworkDetails() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label font-medium tracking-[0.08em] uppercase">
        {walletStepContent.networkDetailsHeading}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm leading-[1.4]">
        {walletStepContent.networkDetails.map((detail) => (
          <div key={detail.label} className="contents">
            <dt className="text-ink-secondary-small">{detail.label}</dt>
            <dd className="font-mono break-all">{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
