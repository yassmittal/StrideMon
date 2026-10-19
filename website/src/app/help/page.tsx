import type { Metadata } from 'next'
import { HelpChatLauncher } from '@/components/help-chat/help-chat-launcher'
import { HelpPage } from '@/components/sections/help-page'
import { StructuredDataScript } from '@/components/ui/structured-data-script'
import { helpPageContent } from '@/content/help'
import { helpPath, markdownPagePaths } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'
import { buildHelpStructuredData } from '@/lib/build-structured-data'

export const metadata: Metadata = buildPageMetadata({
  title: helpPageContent.metaTitle,
  description: helpPageContent.description,
  path: helpPath,
  markdownPath: markdownPagePaths.help,
})

export default function HelpRoutePage() {
  return (
    <>
      <StructuredDataScript
        structuredData={buildHelpStructuredData(helpPageContent.title, helpPath)}
      />
      <HelpPage />
      <HelpChatLauncher />
    </>
  )
}
