import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nextnest.app",
  appName: "NextNest",
  // In live URL mode Capacitor loads all content from the server URL, not
  // from local files. webDir must point to an existing directory for
  // `cap sync` to succeed — `public/` always exists in a Next.js project.
  webDir: "public",
  server: {
    // In production, point to your deployed Railway URL:
    // url: "https://your-app.railway.app",
    // For development, use the local dev server:
    url: "http://localhost:3000",
    cleartext: true,
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
  },
};

export default config;
