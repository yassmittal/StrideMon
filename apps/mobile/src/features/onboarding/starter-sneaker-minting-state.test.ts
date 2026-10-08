import type { OnboardingStatusResponse } from '@stridemon/shared/api-contracts'
import { ApiError } from '../../lib/api-client'
import {
  isOnboardingInProgress,
  toStarterSneakerMintingState,
} from './starter-sneaker-minting-state'

const TRANSACTION_HASH = `0x${'ab'.repeat(32)}`

function buildOnboardingStatus(
  starterSneakerStatus: OnboardingStatusResponse['starterSneaker']['status'],
  gasDripStatus: OnboardingStatusResponse['gasDrip']['status'] = 'pending',
): OnboardingStatusResponse {
  return {
    starterSneaker: { status: starterSneakerStatus, transactionHash: TRANSACTION_HASH },
    gasDrip: { status: gasDripStatus, transactionHash: null },
    starterSneakerKind: 'normal',
    isFoundingPassRequired: false,
  }
}

describe('toStarterSneakerMintingState', () => {
  it('is requesting until the API has answered', () => {
    expect(
      toStarterSneakerMintingState({ requestError: null, onboardingStatus: undefined }),
    ).toEqual({ phase: 'requesting' })
  })

  it('reports a failed request with its API error code', () => {
    const requestError = new ApiError({
      code: 'NETWORK_UNREACHABLE',
      message: 'offline',
      statusCode: null,
    })

    expect(toStarterSneakerMintingState({ requestError, onboardingStatus: undefined })).toEqual({
      phase: 'requestFailed',
      errorCode: 'NETWORK_UNREACHABLE',
    })
  })

  it('is minting while the starter Sneaker transaction is pending', () => {
    const onboardingStatus = buildOnboardingStatus('pending')

    expect(toStarterSneakerMintingState({ requestError: null, onboardingStatus }).phase).toBe(
      'minting',
    )
  })

  it('is arriving once the mint is confirmed, until the chain read sees the Sneaker', () => {
    const onboardingStatus = buildOnboardingStatus('confirmed')

    expect(toStarterSneakerMintingState({ requestError: null, onboardingStatus }).phase).toBe(
      'arriving',
    )
  })

  it('reports a failed mint', () => {
    const onboardingStatus = buildOnboardingStatus('failed')

    expect(toStarterSneakerMintingState({ requestError: null, onboardingStatus }).phase).toBe(
      'mintFailed',
    )
  })
})

describe('isOnboardingInProgress', () => {
  it('keeps polling while either transaction is pending', () => {
    expect(isOnboardingInProgress(buildOnboardingStatus('confirmed', 'pending'))).toBe(true)
  })

  it('stops polling once both transactions have settled', () => {
    expect(isOnboardingInProgress(buildOnboardingStatus('confirmed', 'confirmed'))).toBe(false)
    expect(isOnboardingInProgress(buildOnboardingStatus('failed', 'confirmed'))).toBe(false)
  })
})
