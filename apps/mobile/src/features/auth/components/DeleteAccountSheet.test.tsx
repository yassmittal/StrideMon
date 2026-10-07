import { fireEvent, render, screen } from '@testing-library/react-native'
import { DeleteAccountSheet } from './DeleteAccountSheet'

const noop = () => {}

describe('DeleteAccountSheet', () => {
  it('says the Sneakers stay on-chain and deletes on confirm', async () => {
    const handleConfirmPress = jest.fn()
    await render(
      <DeleteAccountSheet
        isVisible
        isDeleting={false}
        hasFailed={false}
        onConfirmPress={handleConfirmPress}
        onClosePress={noop}
      />,
    )

    expect(screen.getByText(/stay in your wallet/)).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Delete account' }))
    expect(handleConfirmPress).toHaveBeenCalledTimes(1)
  })

  it('explains a failed deletion', async () => {
    await render(
      <DeleteAccountSheet
        isVisible
        isDeleting={false}
        hasFailed
        onConfirmPress={noop}
        onClosePress={noop}
      />,
    )

    expect(screen.getByText(/Couldn’t delete your account/)).toBeTruthy()
  })
})
