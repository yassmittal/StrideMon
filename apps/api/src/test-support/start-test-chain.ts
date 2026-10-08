import { monadTestnet } from '@stridemon/chain'

const ANVIL_STARTUP_TIMEOUT_MILLISECONDS = 10_000
/** Monad's contract size limit (MIP-2). The Founding Pass art renderer is over Ethereum's 24 KB (D-042). */
const MONAD_CONTRACT_SIZE_LIMIT_BYTES = 128 * 1024
const LISTENING_LINE_PATTERN = /Listening on ([\d.]+:\d+)/

export type TestChain = {
  rpcUrl: string
  stop: () => void
}

/**
 * Starts a throwaway Anvil with Monad testnet's chain id and contract size limit on a free
 * port. Tests that make chain calls (signature verification) use it instead of the real
 * testnet RPC. Needs Foundry's `anvil` on the PATH.
 */
export async function startTestChain(): Promise<TestChain> {
  const anvilProcess = Bun.spawn(
    [
      'anvil',
      '--port',
      '0',
      '--chain-id',
      String(monadTestnet.id),
      '--code-size-limit',
      String(MONAD_CONTRACT_SIZE_LIMIT_BYTES),
    ],
    { stdout: 'pipe', stderr: 'inherit' },
  )
  const stop = () => anvilProcess.kill()

  try {
    const hostAndPort = await readListeningAddress(anvilProcess.stdout)
    return { rpcUrl: `http://${hostAndPort}`, stop }
  } catch (error) {
    stop()
    throw error
  }
}

/**
 * Reads Anvil's stdout until it prints its address, then keeps draining it in the
 * background. Anvil logs every RPC call, and an unread pipe would eventually block it.
 */
async function readListeningAddress(stdout: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stdout.getReader()
  const textDecoder = new TextDecoder()
  let output = ''
  const timeoutHandle = setTimeout(() => reader.cancel(), ANVIL_STARTUP_TIMEOUT_MILLISECONDS)

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      output += textDecoder.decode(value, { stream: true })
      const hostAndPort = LISTENING_LINE_PATTERN.exec(output)?.[1]
      if (hostAndPort !== undefined) {
        void drainUntilClosed(reader)
        return hostAndPort
      }
    }
  } finally {
    clearTimeout(timeoutHandle)
  }
  throw new Error(
    `Anvil did not start. Is Foundry installed (\`foundryup -i v1.8.3\`)? Output:\n${output}`,
  )
}

async function drainUntilClosed(reader: { read: () => Promise<{ done: boolean }> }): Promise<void> {
  while (!(await reader.read()).done) {
    // Discard: only the startup line matters.
  }
}
