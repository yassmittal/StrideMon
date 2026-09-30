import { formatDistance } from './format-distance'
import { formatDuration } from './format-duration'
import { formatSpeed } from './format-speed'
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

describe('formatDuration', () => {
  it('shows minutes and zero-padded seconds under an hour', () => {
    expect(formatDuration(1799)).toBe('29:59')
    expect(formatDuration(65)).toBe('1:05')
  })

  it('adds hours from an hour up', () => {
    expect(formatDuration(3845)).toBe('1:04:05')
  })

  it('never shows a negative or fractional time', () => {
    expect(formatDuration(-3)).toBe('0:00')
    expect(formatDuration(4.2)).toBe('0:05')
  })
})

describe('formatDistance', () => {
  it('shows whole meters under a kilometer', () => {
    expect(formatDistance(842.7)).toBe('842 m')
    expect(formatDistance(0)).toBe('0 m')
  })

  it('shows kilometers with two decimals from a kilometer up', () => {
    expect(formatDistance(1_000)).toBe('1.00 km')
    expect(formatDistance(12_345)).toBe('12.35 km')
  })
})

describe('formatSpeed', () => {
  it('shows one decimal of km/h', () => {
    expect(formatSpeed(5.04)).toBe('5.0 km/h')
    expect(formatSpeed(12.36)).toBe('12.4 km/h')
  })

  it('never shows a negative speed', () => {
    expect(formatSpeed(-3.6)).toBe('0.0 km/h')
  })
})
