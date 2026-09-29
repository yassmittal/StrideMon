import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StrideMon',
  slug: 'stridemon',
  scheme: 'stridemon',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.stridemon.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.stridemon.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: ['expo-router', 'expo-secure-store', './plugins/with-wallet-app-queries.js'],
  experiments: {
    typedRoutes: true,
  },
  owner: 'yashmittal',
  extra: {
    eas: {
      projectId: 'e1a123b5-8351-4f4c-9497-f2d1f3e34267',
    },
  },
})
