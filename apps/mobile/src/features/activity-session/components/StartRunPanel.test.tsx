import { fireEvent, render, screen } from '@testing-library/react-native'
import { StartRunPanel } from './StartRunPanel'

describe('StartRunPanel', () => {
  it('starts a run when START is pressed', async () => {
    const onStartPress = jest.fn()
    await render(
      <StartRunPanel
        onStartPress={onStartPress}
        blockedReasonMessage={null}
        isStarting={false}
        errorMessage={null}
      />,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Start a run' }))

    expect(onStartPress).toHaveBeenCalled()
  })

  it('disables START and says why when the Sneaker can’t run', async () => {
    const onStartPress = jest.fn()
    await render(
      <StartRunPanel
        onStartPress={onStartPress}
        blockedReasonMessage="Your Sneaker is out of energy."
        isStarting={false}
        errorMessage={null}
      />,
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Start a run' }))

    expect(onStartPress).not.toHaveBeenCalled()
    expect(screen.getByText('Your Sneaker is out of energy.')).toBeTruthy()
  })

  it('shows why the last start failed', async () => {
    await render(
      <StartRunPanel
        onStartPress={() => {}}
        blockedReasonMessage={null}
        isStarting={false}
        errorMessage="Location is turned off on this phone."
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Location is turned off on this phone.')
  })
})
