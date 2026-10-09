import type { FoundingPassCollectionResponse } from '@stridemon/shared/api-contracts'
import { fireEvent, render, screen } from '@testing-library/react-native'
import type { PassCheck } from '../hooks/useFoundingPassGate'
import { FoundingPassGate } from './FoundingPassGate'

const WALLET_ADDRESS = '0xdfAb550B4D28cD040Cf79Bf350Ac3017923C1465'
const noop = () => {}

const OPEN_MINT_COLLECTION: FoundingPassCollectionResponse = {
  designCount: 1000,
  mintedCount: 612,
  mintedDesignNumbers: [],
  pendingDesignNumbers: [],
  recentMints: [],
  schedule: {
    phase: 'openMint',
    nextPhaseAt: '2026-12-14T14:30:00.000Z',
    waitlistWindowStartsAt: '2026-11-28T14:30:00.000Z',
    openMintStartsAt: '2026-11-30T14:30:00.000Z',
    backupOpeningAt: '2026-12-14T14:30:00.000Z',
  },
  isEarlyAccessGateOn: true,
}

function renderGate({
  collection = OPEN_MINT_COLLECTION,
  isCollectionUnavailable = false,
  passCheck = 'idle',
  onCheckForPassPress = noop,
  onSignOutPress = noop,
}: {
  collection?: FoundingPassCollectionResponse
  isCollectionUnavailable?: boolean
  passCheck?: PassCheck
  onCheckForPassPress?: () => void
  onSignOutPress?: () => void
} = {}) {
  return render(
    <FoundingPassGate
      walletAddress={WALLET_ADDRESS}
      collection={collection}
      isCollectionUnavailable={isCollectionUnavailable}
      passCheck={passCheck}
      onCheckForPassPress={onCheckForPassPress}
      onSignOutPress={onSignOutPress}
      isSigningOut={false}
    />,
  )
}

describe('FoundingPassGate', () => {
  it('says how to get in, where the mint is, and when the app opens to everyone', async () => {
    await renderGate()

    expect(screen.getByText('Mint a Founding Pass to get in early')).toBeTruthy()
    expect(screen.getByText(/can’t be sent or sold/)).toBeTruthy()
    expect(screen.getByText('Minting is open to everyone. 612 of 1,000 minted.')).toBeTruthy()
    expect(screen.getByText(/The app opens to everyone when all 1,000 are minted/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'See the Founding Passes' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Get help' })).toBeTruthy()
  })

  it('shows the signed-in wallet in full, with the way out for a pass in another wallet', async () => {
    const handleSignOutPress = jest.fn()
    await renderGate({ onSignOutPress: handleSignOutPress })

    expect(screen.getByText(WALLET_ADDRESS)).toBeTruthy()
    expect(
      screen.getByText('Minted with another wallet? Sign out and sign in with that one.'),
    ).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }))
    expect(handleSignOutPress).toHaveBeenCalledTimes(1)
  })

  it('checks for a pass on request, and says what to do when none is found', async () => {
    const handleCheckForPassPress = jest.fn()
    const { rerender } = await renderGate({ onCheckForPassPress: handleCheckForPassPress })

    await fireEvent.press(screen.getByRole('button', { name: 'I’ve minted my pass' }))
    expect(handleCheckForPassPress).toHaveBeenCalledTimes(1)

    await rerender(
      <FoundingPassGate
        walletAddress={WALLET_ADDRESS}
        collection={OPEN_MINT_COLLECTION}
        isCollectionUnavailable={false}
        passCheck="checking"
        onCheckForPassPress={noop}
        onSignOutPress={noop}
        isSigningOut={false}
      />,
    )
    expect(screen.getByText('Checking for your pass…')).toBeTruthy()

    await rerender(
      <FoundingPassGate
        walletAddress={WALLET_ADDRESS}
        collection={OPEN_MINT_COLLECTION}
        isCollectionUnavailable={false}
        passCheck="notFound"
        onCheckForPassPress={noop}
        onSignOutPress={noop}
        isSigningOut={false}
      />,
    )
    expect(screen.getByRole('alert').props.children).toMatch(/No pass in this wallet yet/)
  })

  it('still offers the way in when the mint dates can’t load', async () => {
    await render(
      <FoundingPassGate
        walletAddress={WALLET_ADDRESS}
        collection={undefined}
        isCollectionUnavailable
        passCheck="idle"
        onCheckForPassPress={noop}
        onSignOutPress={noop}
        isSigningOut={false}
      />,
    )

    expect(screen.getByText(/Couldn’t load the mint dates just now/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'See the Founding Passes' })).toBeTruthy()
  })
})
