import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inex.driver',
  appName: 'Inex Driver',
  webDir: '../dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'inexdriver.com'
  }
};

export default config;
