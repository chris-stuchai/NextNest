import type { CapacitorConfig } from "@capacitor/cli";

const isProduction = process.env.NODE_ENV === "production";

const config: CapacitorConfig = {
  appId: "com.nextnest.app",
  appName: "NextNest",
  webDir: "public",
  server: {
    url: isProduction
      ? "https://nextnest-web-production.up.railway.app"
      : "http://localhost:3000",
    cleartext: !isProduction,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#fafaf8",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    scheme: "NextNest",
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
