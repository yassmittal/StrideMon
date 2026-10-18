// Gmail ignores dots in the local part, and googlemail.com is the same inbox as gmail.com.
const GMAIL_DOMAIN = 'gmail.com'
const GMAIL_DOMAINS: ReadonlySet<string> = new Set([GMAIL_DOMAIN, 'googlemail.com'])

/**
 * The inbox an email reaches, so one inbox is one sign-up (D-056, data-model.md →
 * waitlistSignups): trimmed and lowercased, a `+tag` dropped on every domain (only when something
 * comes before the `+`), and dots dropped for Gmail, with googlemail.com as gmail.com.
 */
export function foldEmailAddress(email: string): string {
  const lowercasedEmail = email.trim().toLowerCase()
  const atIndex = lowercasedEmail.lastIndexOf('@')
  if (atIndex <= 0) return lowercasedEmail
  const domain = lowercasedEmail.slice(atIndex + 1)
  let localPart = lowercasedEmail.slice(0, atIndex)
  const plusIndex = localPart.indexOf('+')
  if (plusIndex > 0) localPart = localPart.slice(0, plusIndex)
  if (GMAIL_DOMAINS.has(domain)) return `${localPart.replaceAll('.', '')}@${GMAIL_DOMAIN}`
  return `${localPart}@${domain}`
}
