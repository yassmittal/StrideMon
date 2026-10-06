import fastifyCors from '@fastify/cors'
import fastifyPlugin from 'fastify-plugin'

// The only routes a browser may call (D-037). The app is native and sends no Origin, so every
// other route keeps sending no CORS headers at all.
const BROWSER_ROUTE_PATHS: ReadonlySet<string> = new Set(['/v1/waitlist'])

export const corsPlugin = fastifyPlugin(
  async (fastify) => {
    const allowedOrigins = fastify.config.waitlistAllowedOrigins
    await fastify.register(fastifyCors, {
      delegator: (request, callback) => {
        const requestPath = (request.url ?? '').split('?')[0] ?? ''
        if (!BROWSER_ROUTE_PATHS.has(requestPath)) {
          callback(null, { origin: false })
          return
        }
        // An origin outside the list gets no Access-Control-Allow-Origin, so the browser blocks it.
        callback(null, { origin: allowedOrigins, methods: ['POST'], maxAge: 600 })
      },
    })
  },
  { name: 'cors', dependencies: ['env'] },
)
