import type { Metadata } from 'next'
import { HelpChatLauncher } from '@/components/help-chat/help-chat-launcher'
import { HelpPage } from '@/components/sections/help-page'
import { helpPageContent } from '@/content/help'
import { helpPath } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: helpPageContent.metaTitle,
  description: helpPageContent.description,
  path: helpPath,
})

export default function HelpRoutePage() {
  return (
    <>
      <HelpPage />
      <HelpChatLauncher />
    </>
  )
}
