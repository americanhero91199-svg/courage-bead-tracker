import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BeadStoreProvider } from "@/context/BeadStoreContext";
import { BeadDefinitionsProvider } from "@/context/BeadDefinitionsContext";

// ─── Global JS error handler ────────────────────────────────────────────────
// Must be first module-level code so it's active before any other evaluation.
// In adb logcat, filter: adb logcat | grep "BEADS\|ReactNativeJS\|fatal"
if (typeof ErrorUtils !== "undefined") {
  ErrorUtils.setGlobalHandler((error: Error | null, isFatal?: boolean) => {
    console.log("=== BEADS FATAL JS ERROR ===");
    console.log("BEADS isFatal:", isFatal);
    console.log("BEADS message:", error?.message ?? "(no message)");
    console.log("BEADS stack:", error?.stack ?? "(no stack)");
    console.log("=== END BEADS ERROR ===");
  });
}

// ─── Startup checkpoints ─────────────────────────────────────────────────────
// Each log confirms we reached that point. If logcat stops at a checkpoint,
// the crash is in the next step. Filter: adb logcat | grep BEADS
console.log("BEADS [1] _layout module evaluated");

SplashScreen.preventAutoHideAsync();
console.log("BEADS [2] SplashScreen.preventAutoHideAsync() called");

const queryClient = new QueryClient();
console.log("BEADS [3] QueryClient created");

function RootLayoutNav() {
  console.log("BEADS [6] RootLayoutNav rendering");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-bead"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="journal"
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="recap"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="admin"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  console.log("BEADS [4] RootLayout function entered");

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    console.log("BEADS [5] fonts effect — loaded:", fontsLoaded, "error:", fontError?.message ?? null);
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    console.log("BEADS [4b] waiting for fonts…");
    return null;
  }

  console.log("BEADS [4c] fonts ready, rendering providers");

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BeadDefinitionsProvider>
              <BeadStoreProvider>
                <RootLayoutNav />
              </BeadStoreProvider>
            </BeadDefinitionsProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
