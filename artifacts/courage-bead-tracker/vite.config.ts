import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from "vite-plugin-pwa";

// PORT is only needed for the dev/preview server (not for native builds).
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH defaults to "/" for native (Capacitor) builds. Replit sets it
// explicitly via the workflow env to the artifact's path prefix.
const basePath = process.env.BASE_PATH ?? "/";
const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;

// Set CAPACITOR_BUILD=1 to skip the PWA service worker (it conflicts with
// Capacitor's WebView) and produce a plain static build.
const isNativeBuild = process.env.CAPACITOR_BUILD === "1";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(!isNativeBuild
      ? [
          VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            includeAssets: [
              "favicon.svg",
              "favicon-16x16.png",
              "favicon-32x32.png",
              "apple-touch-icon.png",
              "opengraph.jpg",
            ],
            manifest: {
              id: "courage-bead-tracker",
              name: "Courage Bead Tracker",
              short_name: "Courage Beads",
              description:
                "Track and celebrate every bead of courage your child earns on their journey.",
              theme_color: "#ED5773",
              background_color: "#FFFAEB",
              display: "standalone",
              display_override: ["standalone", "minimal-ui"],
              orientation: "portrait",
              start_url: normalizedBase,
              scope: normalizedBase,
              lang: "en",
              categories: ["health", "lifestyle", "medical"],
              icons: [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "any",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any",
                },
                {
                  src: "pwa-maskable-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "maskable",
                },
                {
                  src: "pwa-maskable-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,svg,png,ico,webp,woff,woff2}"],
              navigateFallback: `${normalizedBase}index.html`,
              cleanupOutdatedCaches: true,
              clientsClaim: true,
              skipWaiting: true,
              runtimeCaching: [
                {
                  urlPattern: ({ url }) =>
                    url.origin === "https://fonts.googleapis.com",
                  handler: "StaleWhileRevalidate",
                  options: {
                    cacheName: "google-fonts-stylesheets",
                  },
                },
                {
                  urlPattern: ({ url }) =>
                    url.origin === "https://fonts.gstatic.com",
                  handler: "CacheFirst",
                  options: {
                    cacheName: "google-fonts-webfonts",
                    expiration: {
                      maxEntries: 30,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
                {
                  urlPattern: ({ request }) => request.destination === "image",
                  handler: "CacheFirst",
                  options: {
                    cacheName: "images",
                    expiration: {
                      maxEntries: 60,
                      maxAgeSeconds: 60 * 60 * 24 * 30,
                    },
                  },
                },
              ],
            },
            devOptions: {
              enabled: false,
            },
          }),
        ]
      : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
