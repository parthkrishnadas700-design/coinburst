import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coinburst.app',
  appName: 'CoinBurst',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '44180464714-49os9013g7k1vrbru6nhr3grmpd0hd10.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
