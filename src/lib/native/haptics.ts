import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Triggers a light haptic tap — used for milestone completion and button interactions. */
export async function tapFeedback() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}

/** Triggers a success haptic notification — used for plan generation completion. */
export async function successFeedback() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Success });
  }
}

/** Triggers a medium haptic impact — used for significant actions. */
export async function mediumFeedback() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
}
