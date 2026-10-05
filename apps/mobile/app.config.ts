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
    // D-023: expo-task-manager schedules persisted jobs, which Android refuses without this.
    // Without it the app crashes at the first GPS fix (expo/expo#48935). Granted at install.
    permissions: ['android.permission.RECEIVE_BOOT_COMPLETED'],
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    // Fonts load at runtime (`useFonts` in app/_layout.tsx) while the splash screen stays up.
    'expo-font',
    [
      'expo-splash-screen',
      {
        // design-system.md §2.2 `background`, so the splash hands over to the first screen.
        backgroundColor: '#F0F1FA',
        image: './assets/splash-icon.png',
        imageWidth: 200,
      },
    ],
    [
      'expo-location',
      {
        // D-020: foreground ("while using the app") permission only. Both stores reject vague copy.
        locationWhenInUsePermission:
          'StrideMon uses your location during a walk or run to measure its time, distance and speed. Only your active minutes and distance are recorded on-chain, never your route.',
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        // Keeps recording with the screen locked: iOS background mode, Android foreground service.
        isIosBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    './plugins/with-wallet-app-queries.js',
  ],
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
