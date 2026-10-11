import type { Metadata } from 'next'
import { LegalPage } from '@/components/sections/legal-page'
import { privacyPolicyContent } from '@/content/legal/privacy-policy'
import { legalPagePaths } from '@/content/site'
import { buildPageMetadata } from '@/lib/build-page-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: privacyPolicyContent.title,
  description: privacyPolicyContent.description,
  path: legalPagePaths.privacyPolicy,
})

export default function PrivacyPolicyPage() {
  return <LegalPage content={privacyPolicyContent} />
}
