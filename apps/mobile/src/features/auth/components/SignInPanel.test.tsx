import { fireEvent, render, screen } from '@testing-library/react-native'
import { SignInPanel } from './SignInPanel'

const WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const noop = () => {}

type SignInPanelProps = Parameters<typeof SignInPanel>[0]

// A spread, not default parameters: a default would also replace an explicit `undefined`.
function renderSignInPanel(overrides: Partial<SignInPanelProps>) {
  const props: SignInPanelProps = {
    walletAddress: WALLET_ADDRESS,
    signInState: { phase: 'idle' },
    onConnectWalletPress: noop,
    onSignInPress: noop,
    onDisconnectWalletPress: noop,
    ...overrides,
  }
  return render(<SignInPanel {...props} />)
}

describe('SignInPanel', () => {
  it('asks for a wallet connection before offering to sign', async () => {
    await renderSignInPanel({ walletAddress: undefined })

    expect(screen.getByRole('button', { name: 'Connect wallet' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Sign to verify it’s you' })).toBeNull()
  })

  it('shows the connected wallet and the sign step once connected', async () => {
    await renderSignInPanel({})

    expect(screen.getByText('0xf39F…2266')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign to verify it’s you' })).toBeTruthy()
  })

  it('tells the player to look at their wallet while the signature is pending', async () => {
    await renderSignInPanel({ signInState: { phase: 'awaitingSignature' } })

    expect(screen.getByText('Approve the signature request in your wallet app.')).toBeTruthy()
  })

  it('explains a rejected signature and lets the player try again', async () => {
    const handleSignInPress = jest.fn()
    await renderSignInPanel({
      signInState: { phase: 'failed', errorCode: 'WALLET_REJECTED' },
      onSignInPress: handleSignInPress,
    })

    expect(screen.getByRole('alert').props.children).toMatch(/declined the request in your wallet/)
    await fireEvent.press(screen.getByRole('button', { name: 'Sign to verify it’s you' }))
    expect(handleSignInPress).toHaveBeenCalledTimes(1)
  })

  it('explains an expired sign-in request', async () => {
    await renderSignInPanel({ signInState: { phase: 'failed', errorCode: 'NONCE_EXPIRED' } })

    expect(screen.getByRole('alert').props.children).toMatch(/expired before it was signed/)
  })
})
