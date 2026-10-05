import { render, screen } from '@testing-library/react-native'
import { TRANSFER_BLOCKED_DURING_RUN_MESSAGE, TransferPanel } from './TransferPanel'

const noop = () => {}

describe('TransferPanel', () => {
  it('lets the player start a transfer', async () => {
    await render(
      <TransferPanel sneakerTokenId={4n} isRunInProgress={false} onTransferPress={noop} />,
    )

    expect(screen.getByRole('button', { name: 'Send Sneaker #4' })).toBeEnabled()
  })

  it('is blocked while a run is in progress', async () => {
    await render(<TransferPanel sneakerTokenId={4n} isRunInProgress onTransferPress={noop} />)

    expect(screen.getByRole('button', { name: 'Send Sneaker #4' })).toBeDisabled()
    expect(screen.getByText(TRANSFER_BLOCKED_DURING_RUN_MESSAGE)).toBeTruthy()
  })
})
