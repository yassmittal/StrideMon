// The app refuses to start without its public env (src/config/env.ts). Tests get a fixed one.
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.test'
