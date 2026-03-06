import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Sets up Universal Links / deep link handling for magic link auth.
 * When a user taps the magic link email on iOS, it opens the app
 * instead of Safari (requires Associated Domains entitlement in Xcode).
 */
export function setupDeepLinks(onNavigate: (path: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener("appUrlOpen", ({ url }) => {
    try {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname + parsedUrl.search;
      onNavigate(path);
    } catch {
      console.error("Failed to parse deep link URL:", url);
    }
  });
}

/** Handles app state changes (foreground/background). */
export function setupAppStateListener(onResume?: () => void) {
  if (!Capacitor.isNativePlatform()) return;

  App.addListener("appStateChange", ({ isActive }) => {
    if (isActive && onResume) {
      onResume();
    }
  });
}
