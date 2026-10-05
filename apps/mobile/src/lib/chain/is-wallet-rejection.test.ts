import { UserRejectedRequestError } from 'viem'
import { isWalletRejection } from './is-wallet-rejection'

/** What a viem error from another copy of viem looks like here: right names, foreign classes. */
function createErrorChain(...errorLinks: { name: string; code?: number }[]): Error | undefined {
  return errorLinks.reduceRight<Error | undefined>(
    (cause, { name, code }) => Object.assign(new Error(name, { cause }), { name, code }),
    undefined,
  )
}

describe('isWalletRejection', () => {
  it('spots a MetaMask cancel wrapped by wagmi, even from another viem copy', () => {
    const contractCallError = createErrorChain(
      { name: 'ContractFunctionExecutionError' },
      { name: 'TransactionExecutionError' },
      { name: 'UserRejectedRequestError', code: 4001 },
    )

    expect(isWalletRejection(contractCallError)).toBe(true)
  })

  it('spots this viem copy’s rejection error', () => {
    expect(isWalletRejection(new UserRejectedRequestError(new Error('denied')))).toBe(true)
  })

  it('ignores other failures', () => {
    expect(isWalletRejection(createErrorChain({ name: 'HttpRequestError' }))).toBe(false)
    expect(isWalletRejection(new Error('network down'))).toBe(false)
  })
})
