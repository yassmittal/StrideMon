/** Transactions the game server sends through the outbox (data-model.md → chainTransactions). */
export const CHAIN_TRANSACTION_KINDS = [
  'mintStarterSneaker',
  'sendGasDrip',
  'settleSession',
] as const

export type ChainTransactionKind = (typeof CHAIN_TRANSACTION_KINDS)[number]

export const CHAIN_TRANSACTION_STATUSES = ['queued', 'submitted', 'confirmed', 'failed'] as const

export type ChainTransactionStatus = (typeof CHAIN_TRANSACTION_STATUSES)[number]
