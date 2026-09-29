const VISIBLE_HEX_CHARACTERS_PER_SIDE = 4

/** `0xf39F…2266`: enough to recognise a wallet at a glance, short enough for one line. */
export function formatWalletAddress(walletAddress: string): string {
  const prefixLength = '0x'.length + VISIBLE_HEX_CHARACTERS_PER_SIDE
  return `${walletAddress.slice(0, prefixLength)}…${walletAddress.slice(-VISIBLE_HEX_CHARACTERS_PER_SIDE)}`
}
