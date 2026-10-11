import type { Metadata } from 'next'
import { LegalPage } from '@/components/sections/legal-page'
import { deleteAccountContent } from '@/content/legal/delete-account'
import { legalPagePaths } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: deleteAccountContent.title,
  description: deleteAccountContent.description,
  path: legalPagePaths.deleteAccount,
})

export default function DeleteAccountPage() {
  return <LegalPage content={deleteAccountContent} />
}
