"use client";

import { useNativeInit } from "@/hooks/use-native";

/** Initializes native iOS integrations when running inside Capacitor. */
export function NativeProvider({ children }: { children: React.ReactNode }) {
  useNativeInit();
  return <>{children}</>;
}
