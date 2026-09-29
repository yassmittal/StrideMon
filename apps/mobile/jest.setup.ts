// The app refuses to start without its public env (src/config/env.ts). Tests get a fixed one.
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.test'
process.env.EXPO_PUBLIC_MONAD_CHAIN_ID = '10143'
process.env.EXPO_PUBLIC_MONAD_RPC_URL = 'http://rpc.test'
process.env.EXPO_PUBLIC_REOWN_PROJECT_ID = '0123456789abcdef0123456789abcdef'
