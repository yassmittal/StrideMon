import type { Metadata } from 'next'
import { LegalPage } from '@/components/sections/legal-page'
import { deleteAccountContent } from '@/content/legal/delete-account'
import { legalPagePaths } from '@/content/site'

export const metadata: Metadata = {
  title: deleteAccountContent.title,
  description: deleteAccountContent.description,
  alternates: { canonical: legalPagePaths.deleteAccount },
}

export default function DeleteAccountPage() {
  return <LegalPage content={deleteAccountContent} />
}
