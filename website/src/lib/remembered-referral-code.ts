// This browser's own referral code, so a return visit shows the place in line without a new
// email code (D-041). Browser storage can be missing or blocked, so every access is guarded and
// the form works without it.

const STORAGE_KEY = 'stridemon.waitlist.referralCode'

export function readRememberedReferralCode(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function rememberReferralCode(referralCode: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, referralCode)
  } catch {
    // Not remembered: the visitor verifies by email again next time.
  }
}

export function forgetReferralCode(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored, or storage blocked: nothing to forget.
  }
}
