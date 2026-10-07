import { siteName, supportEmail } from '../site'
import type { LegalPageContent } from './legal-page'

// Must match the app and the Play Data safety form (play-store-release.md 2.1 and 5.6).
export const privacyPolicyContent: LegalPageContent = {
  metaLabels: [siteName, 'Privacy policy'],
  title: 'Privacy policy',
  description:
    'What the StrideMon app and website collect, what goes on the Monad blockchain, and how to delete your data.',
  lastUpdated: '2026-10-07',
  intro: `${siteName} is a move-to-earn game on Monad testnet, built by Yash Mittal. This page says what the app and this website collect, why, and how to delete it. In short: your GPS points stay on our server for at most 30 days, your route never goes on-chain, and we don’t sell data or show ads.`,
  sections: [
    {
      heading: 'What we collect',
      blocks: [
        {
          kind: 'list',
          items: [
            'Your wallet address, when you sign in with your wallet. It identifies your account.',
            'Your precise location, only during a run: from the moment you tap START until you tap STOP, with the app open or the screen locked. Each GPS point has a time, accuracy and speed. The app never reads your location outside a run.',
            'Your runs: when each started and finished, distance, active minutes, whether it passed the fair-play checks, and the STRIDE it earned.',
            'Sign-in sessions: a hashed token that keeps you signed in, and when it expires.',
            'On the website, if you join the waitlist: your email, the phone you said you use (optional), and which link brought you.',
            'On the website: anonymous page-view counts from Vercel Analytics, with no cookies.',
            'Like most servers, ours logs requests (IP address, time, address requested) for security and debugging.',
          ],
        },
      ],
    },
    {
      heading: 'Why',
      blocks: [
        {
          kind: 'paragraph',
          text: 'To measure your walks and runs, to check that a run was done on foot (not in a car or with a faked location), to pay out STRIDE and keep your history, and to write to you once when StrideMon opens if you joined the waitlist.',
        },
      ],
    },
    {
      heading: 'What goes on-chain',
      blocks: [
        {
          kind: 'paragraph',
          text: 'StrideMon runs on the Monad testnet, a public blockchain. Anything written there is public and permanent: nobody, including us, can change or delete it.',
        },
        {
          kind: 'list',
          items: [
            'Which wallet owns which Sneaker, and each Sneaker’s level, stats, energy and durability.',
            'Your STRIDE balance and transfers.',
            'Each settled run: the Sneaker, your wallet, the rewarded minutes, the distance in meters and the STRIDE earned.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Your route and GPS points are never written on-chain.',
        },
      ],
    },
    {
      heading: 'Who we share it with',
      blocks: [
        {
          kind: 'paragraph',
          text: 'We don’t sell your data, and there are no ads. We use these services to run StrideMon:',
        },
        {
          kind: 'list',
          items: [
            'MongoDB Atlas stores the data listed above.',
            'Our server host runs the StrideMon API, and Vercel hosts this website.',
            'Reown (WalletConnect) relays the connection between the app and your wallet app. It sees your wallet address, never your keys.',
            'The Monad testnet, which anyone can read.',
          ],
        },
      ],
    },
    {
      heading: 'How long we keep it',
      blocks: [
        {
          kind: 'list',
          items: [
            'GPS points: deleted automatically 30 days after we receive them.',
            'Sign-in sessions: deleted automatically when they expire, after 30 days.',
            'Your account and runs: until you delete your account.',
            'Waitlist emails: until you ask us to delete yours.',
          ],
        },
      ],
    },
    {
      heading: 'Deleting your data',
      blocks: [
        {
          kind: 'paragraph',
          text: 'In the app, open Profile and tap Delete account. That deletes your account, runs, GPS points and sign-in sessions from our server straight away. You can also ask by email: see the delete account page. On-chain data can’t be deleted, and your Sneakers and STRIDE stay in your wallet.',
        },
        {
          kind: 'paragraph',
          text: `To remove your waitlist email, write to ${supportEmail} from that address.`,
        },
      ],
    },
    {
      heading: 'Security',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Everything between the app, the website and our server travels over HTTPS. The app never sees your wallet’s private keys: you approve every transaction in your own wallet app.',
        },
      ],
    },
    {
      heading: 'Age',
      blocks: [
        {
          kind: 'paragraph',
          text: 'StrideMon is for people 18 and over. We don’t knowingly collect data from anyone younger.',
        },
      ],
    },
    {
      heading: 'Changes and contact',
      blocks: [
        {
          kind: 'paragraph',
          text: `If this policy changes, the date at the top changes with it. Questions or requests: ${supportEmail}.`,
        },
      ],
    },
  ],
}
