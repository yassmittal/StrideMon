import { foundingPassAbi, type StrideMonContractAddresses, sneakerGameAbi } from '@stridemon/chain'
import type { ChainTransactionKind } from '@stridemon/shared/domain'
import { type Abi, type Address, getAddress, type Hex } from 'viem'
import {
  laceFoundingPassPayloadSchema,
  mintFounderSneakerPayloadSchema,
  mintFoundingPassPayloadSchema,
  mintStarterSneakerPayloadSchema,
  sendGasDripPayloadSchema,
  settleSessionPayloadSchema,
} from '../lib/chain-transactions/chain-transaction-payloads'

/** What an outbox record asks the chain to do. */
export type ChainTransactionCall = {
  to: Address
  valueWei: bigint
  /** Set for contract calls, which are simulated before signing. `null` for a plain transfer. */
  contractCall: { abi: Abi; functionName: string; args: readonly unknown[] } | null
}

/**
 * Turns an outbox record into the call to sign. The payload is parsed here,
 * because it comes back from Mongo untyped.
 */
export function buildChainTransactionCall(
  { kind, payload }: { kind: ChainTransactionKind; payload: unknown },
  contractAddresses: StrideMonContractAddresses,
): ChainTransactionCall {
  switch (kind) {
    case 'mintStarterSneaker': {
      const { walletAddress } = mintStarterSneakerPayloadSchema.parse(payload)
      return {
        to: contractAddresses.sneakerGame,
        valueWei: 0n,
        contractCall: {
          abi: sneakerGameAbi,
          functionName: 'mintStarterSneaker',
          args: [getAddress(walletAddress)],
        },
      }
    }
    case 'sendGasDrip': {
      const { walletAddress, amountWei } = sendGasDripPayloadSchema.parse(payload)
      return { to: getAddress(walletAddress), valueWei: BigInt(amountWei), contractCall: null }
    }
    case 'settleSession': {
      const settlement = settleSessionPayloadSchema.parse(payload)
      return {
        to: contractAddresses.sneakerGame,
        valueWei: 0n,
        contractCall: {
          abi: sneakerGameAbi,
          functionName: 'settleSession',
          args: [
            {
              sessionId: settlement.onChainSessionId as Hex,
              tokenId: BigInt(settlement.sneakerTokenId),
              player: getAddress(settlement.walletAddress),
              activeMinutes: settlement.activeMinutes,
              distanceMeters: settlement.distanceMeters,
            },
          ],
        },
      }
    }
    case 'mintFoundingPass': {
      const { walletAddress, designNumber } = mintFoundingPassPayloadSchema.parse(payload)
      return {
        to: contractAddresses.foundingPass,
        valueWei: 0n,
        contractCall: {
          abi: foundingPassAbi,
          functionName: 'mint',
          args: [getAddress(walletAddress), BigInt(designNumber)],
        },
      }
    }
    case 'mintFounderSneaker': {
      const { foundingPassTokenId } = mintFounderSneakerPayloadSchema.parse(payload)
      return {
        to: contractAddresses.sneakerGame,
        valueWei: 0n,
        contractCall: {
          abi: sneakerGameAbi,
          functionName: 'mintFounderSneaker',
          args: [BigInt(foundingPassTokenId)],
        },
      }
    }
    case 'laceFoundingPass': {
      const { foundingPassTokenId } = laceFoundingPassPayloadSchema.parse(payload)
      return {
        to: contractAddresses.foundingPass,
        valueWei: 0n,
        contractCall: {
          abi: foundingPassAbi,
          functionName: 'setLaced',
          args: [BigInt(foundingPassTokenId)],
        },
      }
    }
    default: {
      const unhandledKind: never = kind
      throw new Error(`Unhandled chain transaction kind: ${String(unhandledKind)}`)
    }
  }
}
