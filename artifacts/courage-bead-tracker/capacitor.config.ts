import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.couragebeads.tracker",
  appName: "Courage Beads",
  webDir: "dist/public",
  server: {
    // Use https scheme on Android so localStorage and Web APIs work correctly.
    androidScheme: "https",
  },
  plugins: {
    // Capacitor SplashScreen — shown while the WebView loads.
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#FFFAEB",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
