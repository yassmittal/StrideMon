import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { ApiError } from '../../../lib/api-client'
import { isWalletRejection } from '../../../lib/chain/is-wallet-rejection'
import { requestAuthNonce, verifyAuthSignature } from '../api/auth-api'
import { startAuthSession } from '../auth-session'
import type { SignInErrorCode, SignInState } from '../sign-in-state'
import { CURRENT_USER_QUERY_KEY } from './useCurrentUser'

/**
 * Signs the connected wallet in: nonce → the wallet signs the SIWE message →
 * verify → tokens stored. Connecting the wallet is a separate, earlier step.
 */
export function useSignIn() {
  const { address: walletAddress } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const queryClient = useQueryClient()
  const [signInState, setSignInState] = useState<SignInState>({ phase: 'idle' })

  const signIn = useCallback(async () => {
    if (walletAddress === undefined) {
      setSignInState({ phase: 'failed', errorCode: 'WALLET_NOT_CONNECTED' })
      return
    }

    try {
      setSignInState({ phase: 'requestingMessage' })
      const { message } = await requestAuthNonce(walletAddress)

      setSignInState({ phase: 'awaitingSignature' })
      const signature = await signMessageAsync({ message })

      setSignInState({ phase: 'verifying' })
      const authTokens = await verifyAuthSignature({ message, signature })

      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, { user: authTokens.user })
      await startAuthSession(authTokens)
    } catch (error) {
      const errorCode = toSignInErrorCode(error)
      if (errorCode === 'SIGN_IN_FAILED') console.error('Sign-in failed unexpectedly', error)
      setSignInState({ phase: 'failed', errorCode })
    }
  }, [walletAddress, signMessageAsync, queryClient])

  return { signInState, signIn }
}

function toSignInErrorCode(error: unknown): SignInErrorCode {
  if (error instanceof ApiError) return error.code
  if (isWalletRejection(error)) return 'WALLET_REJECTED'
  return 'SIGN_IN_FAILED'
}
