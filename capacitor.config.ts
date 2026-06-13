import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cbef.messenger',
  appName: 'CBEF',
  webDir: 'dist',
  server: {
    url: 'https://cbef.vercel.app',  // после деплоя заменишь на реальный
    cleartext: false
  }
};

export default config;