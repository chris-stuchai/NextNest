import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

/** Requests push notification permissions and registers the device. */
export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();

  if (permission.receive === "granted") {
    await PushNotifications.register();
  }
}

/** Sets up listeners for push notification events. */
export function setupPushListeners(onNavigate?: (url: string) => void) {
  if (!Capacitor.isNativePlatform()) return;

  PushNotifications.addListener("registration", (token) => {
    console.log("Push registration token:", token.value);
    // TODO: Send token to backend for targeted push notifications
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push registration error:", error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push notification received:", notification);
  });

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification) => {
      const url = notification.notification.data?.url as string | undefined;
      if (url && onNavigate) {
        onNavigate(url);
      }
    }
  );
}
