import { DISPOSABLE_EMAIL_DOMAIN_LIST_TEXT } from './disposable-email-domain-list'

const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set(
  DISPOSABLE_EMAIL_DOMAIN_LIST_TEXT.split('\n').filter((domain) => domain !== ''),
)

/**
 * Whether an email's domain is a temporary inbox (D-056), from the vendored CC0 list. A subdomain
 * of a listed domain counts too (`x.mailinator.com`).
 */
export function isDisposableEmailDomain(email: string): boolean {
  const domainLabels = email
    .slice(email.lastIndexOf('@') + 1)
    .toLowerCase()
    .split('.')
  for (let labelIndex = 0; labelIndex < domainLabels.length - 1; labelIndex += 1) {
    if (DISPOSABLE_EMAIL_DOMAINS.has(domainLabels.slice(labelIndex).join('.'))) return true
  }
  return false
}
