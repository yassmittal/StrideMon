/**
 * Compile-time checks, run by `tsc` (never executed): the generated ABIs are typed
 * precisely enough that a misspelled function or a wrong argument fails the build.
 */
import { encodeFunctionData, zeroAddress, zeroHash } from 'viem'
import { sneakerGameAbi, sneakerNftAbi, soleTokenAbi } from '../src'

export const settleSessionCalldata = encodeFunctionData({
  abi: sneakerGameAbi,
  functionName: 'settleSession',
  args: [
    {
      sessionId: zeroHash,
      tokenId: 1n,
      player: zeroAddress,
      activeMinutes: 10,
      distanceMeters: 830,
    },
  ],
})

export const repairCalldata = encodeFunctionData({
  abi: sneakerGameAbi,
  functionName: 'repair',
  args: [1n],
})

export const misspelledFunctionCalldata = encodeFunctionData({
  abi: sneakerGameAbi,
  // @ts-expect-error: a typo in a function name must not compile
  functionName: 'settleSesion',
  args: [],
})

export const wrongArgumentTypeCalldata = encodeFunctionData({
  abi: sneakerNftAbi,
  functionName: 'getAttributes',
  // @ts-expect-error: token ids are bigint, not number
  args: [1],
})

export const unknownTokenFunctionCalldata = encodeFunctionData({
  abi: soleTokenAbi,
  // @ts-expect-error: SoleToken has no public burn(); only BURNER_ROLE's burnFrom
  functionName: 'burn',
  args: [],
})
