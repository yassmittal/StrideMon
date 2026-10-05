/**
 * How the API client gets access tokens without knowing about auth: the auth
 * feature registers itself here once at startup. That keeps `lib/` from
 * importing `features/`.
 */
export type AccessTokenSource = {
  /** The in-memory access token, or null if there isn't one yet. */
  readAccessToken: () => string | null
  /**
   * Gets a fresh access token with the stored refresh token. Resolves null when
   * the player has been signed out; rejects when the network failed.
   */
  refreshAccessToken: () => Promise<string | null>
}

let registeredAccessTokenSource: AccessTokenSource | null = null

export function registerAccessTokenSource(accessTokenSource: AccessTokenSource): void {
  registeredAccessTokenSource = accessTokenSource
}

export function readRegisteredAccessTokenSource(): AccessTokenSource | null {
  return registeredAccessTokenSource
}
