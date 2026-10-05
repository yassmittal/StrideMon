import { describeTransferRecipientProblem, toTransferRecipient } from './transfer-recipient'

const WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const RECIPIENT_LOWERCASE = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const RECIPIENT_CHECKSUMMED = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

describe('toTransferRecipient', () => {
  it('accepts another wallet and returns it checksummed', () => {
    expect(
      toTransferRecipient({
        recipientInput: ` ${RECIPIENT_LOWERCASE} `,
        walletAddress: WALLET_ADDRESS,
      }),
    ).toEqual({ status: 'valid', recipientWalletAddress: RECIPIENT_CHECKSUMMED })
  })

  it('refuses something that isn’t an address', () => {
    expect(
      toTransferRecipient({ recipientInput: '0x1234', walletAddress: WALLET_ADDRESS }),
    ).toEqual({
      status: 'invalid',
    })
  })

  it('refuses the player’s own wallet, whatever the letter case', () => {
    expect(
      toTransferRecipient({
        recipientInput: WALLET_ADDRESS.toLowerCase(),
        walletAddress: WALLET_ADDRESS,
      }),
    ).toEqual({ status: 'ownWallet' })
  })
})

describe('describeTransferRecipientProblem', () => {
  it('says nothing while the field is empty', () => {
    expect(describeTransferRecipientProblem({ status: 'empty' })).toBeNull()
  })

  it('explains a self-transfer', () => {
    expect(describeTransferRecipientProblem({ status: 'ownWallet' })).toBe(
      'That’s your own wallet. Enter the address you want to send it to.',
    )
  })
})
