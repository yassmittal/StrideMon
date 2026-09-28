import { z } from 'zod'

const publicEnvironmentSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.url(),
})

// Expo inlines EXPO_PUBLIC_* at build time only when each one is read by its
// full static name, so they're listed one by one rather than passing process.env.
const parseResult = publicEnvironmentSchema.safeParse({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
})

if (!parseResult.success) {
  const problems = parseResult.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`,
  )
  throw new Error(`Invalid app environment (see apps/mobile/.env.example): ${problems.join('; ')}`)
}

export const appEnvironment = {
  apiBaseUrl: parseResult.data.EXPO_PUBLIC_API_BASE_URL.replace(/\/+$/, ''),
}
