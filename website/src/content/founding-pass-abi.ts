// The four `FoundingPass` reads the site makes (D-045), copied by hand from
// `packages/chain/src/abis/founding-pass-abi.ts`: the site never imports `@stridemon/*` (D-035).
// They're the standard ERC-721 reads plus `passOf` and `imageSvg`, so a redeploy keeps them.
export const foundingPassReadAbi = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenOfOwnerByIndex',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'passOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'founderNumber', type: 'uint32' },
          { name: 'hasGoldFrame', type: 'bool' },
          { name: 'isLaced', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'imageSvg',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const
