import { render, screen } from '@testing-library/react-native'
import {
  FOUNDER_SNEAKER_TRANSFER_MESSAGE,
  TRANSFER_BLOCKED_DURING_RUN_MESSAGE,
  TransferPanel,
} from './TransferPanel'

const noop = () => {}

describe('TransferPanel', () => {
  it('lets the player start a transfer', async () => {
    await render(
      <TransferPanel
        sneakerTokenId={4n}
        isRunInProgress={false}
        isFounderSneaker={false}
        onTransferPress={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send Sneaker #4' })).toBeEnabled()
  })

  it('is blocked while a run is in progress', async () => {
    await render(
      <TransferPanel
        sneakerTokenId={4n}
        isRunInProgress
        isFounderSneaker={false}
        onTransferPress={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send Sneaker #4' })).toBeDisabled()
    expect(screen.getByText(TRANSFER_BLOCKED_DURING_RUN_MESSAGE)).toBeTruthy()
  })

  it('never sends a Founder Sneaker, and says why', async () => {
    await render(
      <TransferPanel
        sneakerTokenId={1n}
        isRunInProgress={false}
        isFounderSneaker
        onTransferPress={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send Sneaker #1' })).toBeDisabled()
    expect(screen.getByText(FOUNDER_SNEAKER_TRANSFER_MESSAGE)).toBeTruthy()
  })

  it('waits, disabled, while it checks whether the Sneaker is a Founder Sneaker', async () => {
    await render(
      <TransferPanel
        sneakerTokenId={4n}
        isRunInProgress={false}
        isFounderSneaker={undefined}
        onTransferPress={noop}
      />,
    )

    expect(screen.getByRole('button', { name: 'Send Sneaker #4' })).toBeDisabled()
  })
})
