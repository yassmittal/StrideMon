import { registerAccessTokenSource } from '../../lib/api-client'
import { authSessionAccessTokenSource } from './auth-session'

// Imported for its side effect by index.ts, before the router: the API client can
// then refresh tokens without any UI, which the headless location task needs (D-020).
registerAccessTokenSource(authSessionAccessTokenSource)
