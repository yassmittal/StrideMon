import { formatTokenAmount } from './format-token-amount'
import { formatWalletAddress } from './format-wallet-address'

describe('formatWalletAddress', () => {
  it('keeps the first and last four hex characters', () => {
    expect(formatWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe('0xf39F…2266')
  })
})

describe('formatTokenAmount', () => {
  it('shows whole amounts without a decimal point', () => {
    expect(formatTokenAmount({ amountWei: 2n * 10n ** 18n, decimals: 18, symbol: 'MON' })).toBe(
      '2 MON',
    )
  })

  it('rounds down to four fraction digits and drops trailing zeros', () => {
    expect(
      formatTokenAmount({ amountWei: 1_234_567_000_000_000_000n, decimals: 18, symbol: 'MON' }),
    ).toBe('1.2345 MON')
    expect(
      formatTokenAmount({ amountWei: 100_000_000_000_000_000n, decimals: 18, symbol: 'MON' }),
    ).toBe('0.1 MON')
  })

  it('shows a zero balance as 0', () => {
    expect(formatTokenAmount({ amountWei: 0n, decimals: 18, symbol: 'MON' })).toBe('0 MON')
  })
})
