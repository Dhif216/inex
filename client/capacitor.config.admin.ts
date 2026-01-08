import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inex.admin',
  appName: 'Inex Admin',
  webDir: '../dist-admin',
  server: {
    androidScheme: 'https',
    cleartext: true,
    hostname: 'inexadmin.com'
  }
};

export default config;
