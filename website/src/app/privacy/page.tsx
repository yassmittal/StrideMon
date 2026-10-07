import type { Metadata } from 'next'
import { LegalPage } from '@/components/sections/legal-page'
import { privacyPolicyContent } from '@/content/legal/privacy-policy'
import { legalPagePaths } from '@/content/site'

export const metadata: Metadata = {
  title: privacyPolicyContent.title,
  description: privacyPolicyContent.description,
  alternates: { canonical: legalPagePaths.privacyPolicy },
}

export default function PrivacyPolicyPage() {
  return <LegalPage content={privacyPolicyContent} />
}
