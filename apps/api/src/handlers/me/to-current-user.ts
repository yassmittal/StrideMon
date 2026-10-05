import type { CurrentUser } from '@stridemon/shared/api-contracts'
import { getAddress } from 'viem'
import type { UserDocument } from '../../repositories/users-repository'

export function toCurrentUser(userDocument: UserDocument): CurrentUser {
  return {
    userId: userDocument._id.toHexString(),
    walletAddress: getAddress(userDocument.walletAddress),
    hasReceivedStarterSneaker: userDocument.hasReceivedStarterSneaker,
    hasReceivedGasDrip: userDocument.hasReceivedGasDrip,
    createdAt: userDocument.createdAt.toISOString(),
  }
}
