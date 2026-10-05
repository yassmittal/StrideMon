import { getErrorMessage } from '@stridemon/shared/errors'
import closeWithGrace from 'close-with-grace'
import { buildServer } from './build-server'

const SHUTDOWN_GRACE_PERIOD_MILLISECONDS = 10_000

const server = await buildServer({ environmentVariables: process.env }).catch((error: unknown) => {
  // No logger exists yet when config or Mongo fails, so write straight to stderr.
  process.stderr.write(`StrideMon API failed to start.\n${getErrorMessage(error)}\n`)
  process.exit(1)
})

closeWithGrace({ delay: SHUTDOWN_GRACE_PERIOD_MILLISECONDS }, async ({ err: shutdownError }) => {
  if (shutdownError) server.log.error({ err: shutdownError }, 'Shutting down after an error')
  await server.close()
})

// Production sits behind nginx on the same instance (D-034), so it listens on loopback only.
// Development listens on every interface, so a phone on the same Wi-Fi reaches it by LAN IP.
const listenHost = server.config.nodeEnvironment === 'production' ? '127.0.0.1' : '0.0.0.0'
await server.listen({ port: server.config.apiPort, host: listenHost })
