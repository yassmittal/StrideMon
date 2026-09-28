import { getErrorMessage } from '@stridemon/shared/errors'
import closeWithGrace from 'close-with-grace'
import { buildServer } from './build-server'

// All interfaces, so a phone on the same Wi-Fi can reach the dev API by LAN IP.
const LISTEN_HOST = '0.0.0.0'
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

await server.listen({ port: server.config.apiPort, host: LISTEN_HOST })
