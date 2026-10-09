import type { StarterSneakerKind } from '@stridemon/shared/domain'
import { fireEvent, render, screen } from '@testing-library/react-native'
import type { StarterSneakerMintingState } from '../starter-sneaker-minting-state'
import { StarterSneakerMinting } from './StarterSneakerMinting'

const TRANSACTION_HASH = `0x${'ab'.repeat(32)}`
const noop = () => {}

function renderMinting(
  mintingState: StarterSneakerMintingState,
  onRetryPress = noop,
  starterSneakerKind: StarterSneakerKind = 'normal',
) {
  return render(
    <StarterSneakerMinting
      mintingState={mintingState}
      starterSneakerKind={starterSneakerKind}
      isGamePaused={false}
      onRetryPress={onRetryPress}
      isRetrying={false}
    />,
  )
}

describe('StarterSneakerMinting', () => {
  it('shows both steps as in progress while the mint is pending, with a link once signed', async () => {
    await renderMinting({
      phase: 'minting',
      onboardingStatus: {
        starterSneaker: { status: 'pending', transactionHash: TRANSACTION_HASH },
        gasDrip: { status: 'pending', transactionHash: null },
        starterSneakerKind: 'normal',
        isFoundingPassRequired: false,
      },
    })

    expect(screen.getByText('Minting your Sneaker…')).toBeTruthy()
    expect(screen.getByLabelText('Your starter Sneaker: Minting on Monad…')).toBeTruthy()
    expect(screen.getByLabelText('MON for gas: Sending…')).toBeTruthy()
    expect(
      screen.getByRole('link', {
        name: 'Your starter Sneaker: view the transaction on the explorer',
      }),
    ).toBeTruthy()
  })

  it('says the Sneaker is on its way once minted', async () => {
    await renderMinting({
      phase: 'arriving',
      onboardingStatus: {
        starterSneaker: { status: 'confirmed', transactionHash: TRANSACTION_HASH },
        gasDrip: { status: 'confirmed', transactionHash: TRANSACTION_HASH },
        starterSneakerKind: 'normal',
        isFoundingPassRequired: false,
      },
    })

    expect(screen.getByText('Your Sneaker is here')).toBeTruthy()
    expect(screen.getByText('Loading your Sneaker from Monad…')).toBeTruthy()
    expect(screen.getByLabelText('MON for gas: In your wallet')).toBeTruthy()
  })

  it('explains an unreachable server and retries on request', async () => {
    const handleRetryPress = jest.fn()
    await renderMinting(
      { phase: 'requestFailed', errorCode: 'NETWORK_UNREACHABLE' },
      handleRetryPress,
    )

    expect(screen.getByRole('alert').props.children).toMatch(/Can’t reach the StrideMon server/)
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }))
    expect(handleRetryPress).toHaveBeenCalledTimes(1)
  })

  it('explains a failed mint and offers to check again', async () => {
    await renderMinting({
      phase: 'mintFailed',
      onboardingStatus: {
        starterSneaker: { status: 'failed', transactionHash: null },
        gasDrip: { status: 'confirmed', transactionHash: TRANSACTION_HASH },
        starterSneakerKind: 'normal',
        isFoundingPassRequired: false,
      },
    })

    expect(screen.getByText('We couldn’t mint your Sneaker')).toBeTruthy()
    expect(screen.getByRole('alert').props.children).toMatch(/nothing was charged/)
    expect(screen.getByRole('button', { name: 'Check again' })).toBeTruthy()
  })

  it('names the Founder Sneaker for a pass holder, with a help link when it fails', async () => {
    await renderMinting(
      {
        phase: 'mintFailed',
        onboardingStatus: {
          starterSneaker: { status: 'failed', transactionHash: null },
          gasDrip: { status: 'confirmed', transactionHash: TRANSACTION_HASH },
          starterSneakerKind: 'founder',
          isFoundingPassRequired: false,
        },
      },
      noop,
      'founder',
    )

    expect(screen.getByText('We couldn’t mint your Founder Sneaker')).toBeTruthy()
    expect(screen.getByText(/can’t be sent or sold/)).toBeTruthy()
    expect(screen.getByLabelText('Your Founder Sneaker: Not minted')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Get help' })).toBeTruthy()
  })
})
