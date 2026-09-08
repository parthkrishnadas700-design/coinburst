import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coinburst.app',
  appName: 'CoinBurst',
  webDir: 'dist',
  server: {
    url: 'https://coinburst-5bdc5.web.app',
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
