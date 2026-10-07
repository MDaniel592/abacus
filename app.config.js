const IS_DEV = process.env.APP_VARIANT === 'development';
const EAS_PROJECT_ID = 'ef46b4e9-771d-4e19-ada2-5946ddfb078f';

export default {
  name: IS_DEV ? 'Abacus Personal.dev' : 'Abacus Personal',
  owner: 'mmdaniel',
  description: 'Abacus: Firefly III mobile application.',
  slug: 'abacus',
  privacy: 'public',
  platforms: [
    'ios',
    'android',
  ],
  version: '0.25.0',
  orientation: 'portrait',
  updates: {
    enabled: false,
  },
  ios: {
    icon: './src/images/icon-abacus.png',
    splash: {
      image: './src/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        backgroundColor: '#121215',
      },
    },
    supportsTablet: true,
    infoPlist: {
      NSFaceIDUsageDescription: 'Abacus use Authentication with TouchId or FaceID',
      NSLocalNetworkUsageDescription: 'Abacus use Local Network to access Firefly III on your local network',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
    config: {
      usesNonExemptEncryption: false,
    },
    bundleIdentifier: IS_DEV ? 'io.github.mdaniel592.abacus.dev' : 'io.github.mdaniel592.abacus',
    buildNumber: '0.25.0',
  },
  android: {
    icon: './src/images/icon-abacus.png',
    adaptiveIcon: {
      foregroundImage: './src/images/icon-abacus-foreground.png',
      backgroundImage: './src/images/icon-abacus-background.png',
    },
    splash: {
      image: './src/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
      dark: {
        backgroundColor: '#121215',
      },
    },
    playStoreUrl: 'https://play.google.com/store/apps/details?id=abacus.fireflyiii.android.app',
    package: IS_DEV ? 'io.github.mdaniel592.abacus.dev' : 'io.github.mdaniel592.abacus',
    versionCode: 41,
  },
  scheme: 'abacuspersonal',
  githubUrl: 'https://github.com/MDaniel592/abacus',
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
  plugins: [
    'expo-asset',
    'expo-secure-store',
    'expo-localization',
    './plugins/withAndroidManifest',
    [
      'expo-font',
      {
        fonts: [
          './src/fonts/Montserrat-Bold.ttf',
          './src/fonts/Montserrat-Regular.ttf',
          './src/fonts/Montserrat-Light.ttf',
        ],
      },
    ],
    [
      'expo-quick-actions',
      {
        androidIcons: {
          shortcut_add: {
            foregroundImage: './src/images/icon-adaptive-add.png',
            backgroundColor: '#FF5533',
          },
        },
      },
    ],
  ],
  userInterfaceStyle: 'automatic',
};
