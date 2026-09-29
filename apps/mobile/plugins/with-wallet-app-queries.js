// @ts-check
// Plain CommonJS: Expo loads config plugins listed by path without compiling TypeScript.
const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins')

/**
 * Wallet apps AppKit should detect as installed, to list them first and open
 * them directly. Android 11+ and iOS both hide other apps unless they're declared.
 * MetaMask is the wallet Phase 2 is tested with (D-018); the rest are common ones.
 */
const WALLET_APPS = [
  { androidPackageName: 'io.metamask', iosUrlScheme: 'metamask' },
  { androidPackageName: 'com.wallet.crypto.trustapp', iosUrlScheme: 'trust' },
  { androidPackageName: 'me.rainbow', iosUrlScheme: 'rainbow' },
  { androidPackageName: 'com.okinc.okex.gp', iosUrlScheme: 'okex' },
]

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withWalletAppQueries = (config) => {
  const configWithAndroidQueries = withAndroidManifest(config, (androidConfig) => {
    const manifest = androidConfig.modResults.manifest
    // Merge into, never replace, the <queries> other plugins add (browser intents, etc.).
    const existingQueries = manifest.queries?.[0] ?? {}
    const walletPackages = WALLET_APPS.map((walletApp) => ({
      $: { 'android:name': walletApp.androidPackageName },
    }))
    manifest.queries = [
      { ...existingQueries, package: [...(existingQueries.package ?? []), ...walletPackages] },
    ]
    return androidConfig
  })

  return withInfoPlist(configWithAndroidQueries, (iosConfig) => {
    const existingSchemes = iosConfig.modResults.LSApplicationQueriesSchemes ?? []
    const walletSchemes = WALLET_APPS.map((walletApp) => walletApp.iosUrlScheme)
    iosConfig.modResults.LSApplicationQueriesSchemes = [
      ...new Set([...existingSchemes, ...walletSchemes]),
    ]
    return iosConfig
  })
}

module.exports = withWalletAppQueries
