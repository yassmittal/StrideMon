import fastifyCors from '@fastify/cors'
import fastifyPlugin from 'fastify-plugin'

// The only routes a browser may call: the landing page's waitlist and its invites (D-037, D-056),
// the Founding Pass page's sign-in and pass routes (D-043), and the help chatbot (D-048). The app is
// native and sends no Origin, so every other route keeps sending no CORS headers at all.
const BROWSER_ROUTE_PATHS: ReadonlySet<string> = new Set([
  '/v1/waitlist',
  '/v1/auth/nonce',
  '/v1/auth/verify',
  '/v1/auth/refresh',
  '/v1/help/chat',
])
const BROWSER_ROUTE_PATH_PREFIXES = ['/v1/pass/', '/v1/waitlist/']

export const corsPlugin = fastifyPlugin(
  async (fastify) => {
    const websiteOrigins = fastify.config.waitlistAllowedOrigins
    await fastify.register(fastifyCors, {
      delegator: (request, callback) => {
        const requestPath = (request.url ?? '').split('?')[0] ?? ''
        if (!isBrowserRoutePath(requestPath)) {
          callback(null, { origin: false })
          return
        }
        // An origin outside the list gets no Access-Control-Allow-Origin, so the browser blocks it.
        callback(null, {
          origin: websiteOrigins,
          methods: ['GET', 'POST'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          maxAge: 600,
        })
      },
    })
  },
  { name: 'cors', dependencies: ['env'] },
)

function isBrowserRoutePath(requestPath: string): boolean {
  return (
    BROWSER_ROUTE_PATHS.has(requestPath) ||
    BROWSER_ROUTE_PATH_PREFIXES.some((pathPrefix) => requestPath.startsWith(pathPrefix))
  )
}
