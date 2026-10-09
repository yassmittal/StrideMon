import type { Metadata } from 'next'
import { HelpChatLauncher } from '@/components/help-chat/help-chat-launcher'
import { HelpPage } from '@/components/sections/help-page'
import { helpPageContent } from '@/content/help'
import { helpPath, xCardMetadata } from '@/content/site'

export const metadata: Metadata = {
  title: helpPageContent.metaTitle,
  description: helpPageContent.description,
  alternates: { canonical: helpPath },
  openGraph: {
    url: helpPath,
    title: helpPageContent.metaTitle,
    description: helpPageContent.description,
  },
  twitter: {
    ...xCardMetadata,
    title: helpPageContent.metaTitle,
    description: helpPageContent.description,
  },
}

export default function HelpRoutePage() {
  return (
    <>
      <HelpPage />
      <HelpChatLauncher />
    </>
  )
}
