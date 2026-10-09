import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { playLacedHaptic } from '../../../lib/haptics/play-haptic'
import { useLacedMoment } from './useLacedMoment'

const WALLET_ADDRESS = '0x00000000000000000000000000000000000000aa'

// What the chain says, by function name: one pass, #137, with its Founder Sneaker.
const mockChainValues: Record<string, unknown> = {}

jest.mock('wagmi', () => ({
  useReadContract: ({ functionName }: { functionName: string }) => ({
    data: mockChainValues[functionName],
    isError: false,
    refetch: jest.fn(),
  }),
}))
jest.mock('../../../lib/haptics/play-haptic', () => ({ playLacedHaptic: jest.fn() }))

function setPassLaced(isLaced: boolean) {
  Object.assign(mockChainValues, {
    balanceOf: 1n,
    tokenOfOwnerByIndex: 137n,
    passOf: { founderNumber: 42, hasGoldFrame: false, isLaced },
    founderSneakerTokenIdOf: 1n,
  })
}

async function renderLacedMoment() {
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const rendered = await renderHook(
    () => useLacedMoment({ walletAddress: WALLET_ADDRESS, isSettled: true }),
    { wrapper },
  )
  return { ...rendered, invalidateQueries }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useLacedMoment', () => {
  it('shows the moment once it sees the pass turn laced, and refreshes the pictures', async () => {
    setPassLaced(false)
    const { result, rerender, invalidateQueries } = await renderLacedMoment()
    expect(result.current).toBeNull()

    setPassLaced(true)
    await rerender({})

    expect(result.current).toMatchObject({ designNumber: 137, isLaced: true })
    expect(playLacedHaptic).toHaveBeenCalledTimes(1)
    expect(invalidateQueries).toHaveBeenCalled()
  })

  it('never replays the moment for a pass that was already laced', async () => {
    setPassLaced(true)
    const { result, rerender } = await renderLacedMoment()
    await rerender({})

    expect(result.current).toBeNull()
    expect(playLacedHaptic).not.toHaveBeenCalled()
  })
})
