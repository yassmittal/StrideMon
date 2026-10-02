import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { UserRejectedRequestError } from 'viem'
import { useSneakerGameTransaction } from './useSneakerGameTransaction'

const WALLET_ADDRESS = '0x00000000000000000000000000000000000000aa'
const TRANSACTION_HASH = `0x${'ab'.repeat(32)}`
const GAS_UNITS = 100_000n
const MAX_FEE_PER_GAS_WEI = 100_000_000_000n

const mockChainReader = {
  estimateContractGas: jest.fn(),
  estimateFeesPerGas: jest.fn(),
  getBalance: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}
const mockWriteContractAsync = jest.fn()

jest.mock('wagmi', () => ({
  useAccount: () => ({ address: WALLET_ADDRESS }),
  usePublicClient: () => mockChainReader,
  useWriteContract: () => ({ writeContractAsync: mockWriteContractAsync }),
}))

beforeEach(() => {
  jest.resetAllMocks()
  mockChainReader.estimateContractGas.mockResolvedValue(GAS_UNITS)
  mockChainReader.estimateFeesPerGas.mockResolvedValue({ maxFeePerGas: MAX_FEE_PER_GAS_WEI })
  mockChainReader.getBalance.mockResolvedValue(10n ** 18n)
  mockChainReader.waitForTransactionReceipt.mockResolvedValue({ status: 'success' })
  mockWriteContractAsync.mockResolvedValue(TRANSACTION_HASH)
})

async function renderTransaction() {
  const queryClient = new QueryClient()
  const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const rendered = await renderHook(() => useSneakerGameTransaction(), { wrapper })
  return { ...rendered, invalidateQueries }
}

describe('useSneakerGameTransaction', () => {
  it('signs, waits for the receipt and re-reads the chain', async () => {
    const { result, invalidateQueries } = await renderTransaction()

    await act(() => result.current.submit({ functionName: 'upgrade', sneakerTokenId: 4n }))

    expect(mockWriteContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'upgrade', args: [4n] }),
    )
    expect(result.current.transactionState).toEqual({
      phase: 'succeeded',
      transactionHash: TRANSACTION_HASH,
    })
    expect(invalidateQueries).toHaveBeenCalled()
  })

  it('reports a wallet cancel as WALLET_REJECTED', async () => {
    mockWriteContractAsync.mockRejectedValue(new UserRejectedRequestError(new Error('denied')))
    const { result } = await renderTransaction()

    await act(() => result.current.submit({ functionName: 'repair', sneakerTokenId: 4n }))

    expect(result.current.transactionState).toEqual({
      phase: 'failed',
      errorCode: 'WALLET_REJECTED',
    })
  })

  it('says the MON is too low before opening the wallet', async () => {
    mockChainReader.getBalance.mockResolvedValue(GAS_UNITS * MAX_FEE_PER_GAS_WEI - 1n)
    const { result } = await renderTransaction()

    await act(() => result.current.submit({ functionName: 'repair', sneakerTokenId: 4n }))

    expect(mockWriteContractAsync).not.toHaveBeenCalled()
    expect(result.current.transactionState).toEqual({
      phase: 'failed',
      errorCode: 'NOT_ENOUGH_GAS',
    })
  })
})
