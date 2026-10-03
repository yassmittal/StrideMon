import { fireEvent, render, screen } from '@testing-library/react-native'
import { TextField } from './TextField'

describe('TextField', () => {
  it('passes typing through and submits with the arrow', async () => {
    const onChangeText = jest.fn()
    const onSubmitPress = jest.fn()
    await render(
      <TextField
        label="Recipient wallet address"
        value=""
        onChangeText={onChangeText}
        onSubmitPress={onSubmitPress}
        submitAccessibilityLabel="Review"
      />,
    )

    await fireEvent.changeText(screen.getByLabelText('Recipient wallet address'), '0xabc')
    await fireEvent.press(screen.getByRole('button', { name: 'Review' }))

    expect(onChangeText).toHaveBeenCalledWith('0xabc')
    expect(onSubmitPress).toHaveBeenCalled()
  })

  it('shows the problem and blocks the arrow while the value is invalid', async () => {
    await render(
      <TextField
        label="Recipient wallet address"
        value="0x12"
        onChangeText={jest.fn()}
        errorMessage="That isn’t a full wallet address."
        onSubmitPress={jest.fn()}
        isSubmitDisabled
        submitAccessibilityLabel="Review"
      />,
    )

    expect(screen.getByText('That isn’t a full wallet address.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Review' })).toBeDisabled()
  })
})
