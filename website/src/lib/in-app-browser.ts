// Google refuses its sign-in inside apps' own browsers ("Android and iOS webviews are not
// supported", D-057): Instagram, Facebook, LinkedIn, and any Android WebView. There the site shows
// one line and the email-and-code path instead of the button.
const IN_APP_BROWSER_PATTERNS: readonly RegExp[] = [
  /Instagram/i,
  /FBAN|FBAV|FB_IAB|FBIOS/,
  /LinkedInApp/i,
  /Snapchat/i,
  /\bLine\//,
  // Android's WebView marks itself "; wv)".
  /; wv\)/,
]

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER_PATTERNS.some((pattern) => pattern.test(userAgent))
}
