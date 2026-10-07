import { siteName, supportEmail } from '../site'
import type { LegalPageContent } from './legal-page'

// Google Play's account deletion page (play-store-release.md 2.2, D-039).
export const deleteAccountContent: LegalPageContent = {
  metaLabels: [siteName, 'Account'],
  title: 'Delete your account',
  description:
    'How to delete your StrideMon account and data, what is deleted, and what stays on the Monad blockchain.',
  lastUpdated: '2026-10-07',
  intro: `You can delete your ${siteName} account at any time, from the app or by email. You don’t need to reinstall anything.`,
  sections: [
    {
      heading: 'In the app',
      blocks: [
        {
          kind: 'list',
          items: [
            'Open StrideMon and sign in with your wallet.',
            'Go to the Profile tab and tap Delete account.',
            'Confirm. Your data is deleted straight away and the app signs you out.',
          ],
        },
      ],
    },
    {
      heading: 'By email',
      blocks: [
        {
          kind: 'paragraph',
          text: `If you can’t use the app, email ${supportEmail} with the subject “Delete my StrideMon account” and your wallet address. We’ll ask you to sign a short message with that wallet, to prove it’s yours, then delete the account within 30 days and reply when it’s done.`,
        },
      ],
    },
    {
      heading: 'What is deleted',
      blocks: [
        {
          kind: 'list',
          items: [
            'Your account record (your wallet address and sign-in dates).',
            'Your run history and every GPS point of your runs.',
            'Your sign-in sessions on every phone.',
          ],
        },
      ],
    },
    {
      heading: 'What stays',
      blocks: [
        {
          kind: 'list',
          items: [
            'Everything on the Monad blockchain, which is public and can’t be changed by anyone: your Sneakers, your STRIDE, and the settled runs recorded there. They stay in your wallet, and you can keep using them.',
            'A record that your wallet already received its free starter Sneaker and test MON, so a wallet gets them only once.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'You can sign in again later with the same wallet. You’ll start with an empty run history.',
        },
      ],
    },
  ],
}
