import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

// ─── iOS-only modules — lazy conditional require ──────────────────────────────
//
// Both expo-blur and expo-symbols call requireNativeViewManager /
// requireNativeModule at module-evaluation time (not inside a function).
// On Android, neither native view is registered, so the call throws a
// JavascriptException before any component renders.
//
// Static `import` statements are evaluated unconditionally on every platform
// even when the JSX is guarded with `isIOS`. The fix: only require() these
// modules when Platform.OS === "ios" so Android never touches them.
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlurView: any =
  Platform.OS === "ios" ? require("expo-blur").BlurView : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SymbolView: any =
  Platform.OS === "ios" ? require("expo-symbols").SymbolView : null;

console.log(
  "BEADS [7] (tabs)/_layout evaluated — Platform.OS:",
  Platform.OS,
  "BlurView loaded:",
  BlurView !== null,
  "SymbolView loaded:",
  SymbolView !== null
);

export default function TabLayout() {
  console.log("BEADS [8] TabLayout rendering");
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "Timeline",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="list.bullet" tintColor={color} size={24} />
            ) : (
              <Feather name="activity" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={24} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
