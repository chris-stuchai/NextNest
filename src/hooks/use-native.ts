"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import {
  registerPushNotifications,
  setupPushListeners,
  setupDeepLinks,
  setupAppStateListener,
} from "@/lib/native";

/**
 * Initializes native platform integrations (push notifications, deep links,
 * app state). Safe to call on web — all native calls are gated behind
 * Capacitor.isNativePlatform().
 */
export function useNativeInit() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    registerPushNotifications();
    setupPushListeners((url) => router.push(url));
    setupDeepLinks((path) => router.push(path));
    setupAppStateListener();
  }, [router]);
}
