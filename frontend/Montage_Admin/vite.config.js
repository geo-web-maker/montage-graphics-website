import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "icons/*.png"],
      manifest: {
        name: "Montage Admin",
        short_name: "Montage Admin",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#E9E7DF",
        theme_color: "#2F4B3C",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        // Never cache API traffic: admin data must always be live.
        navigateFallbackDenylist: [/^\/montage\//],
        runtimeCaching: [],
      },
    }),
  ],
});
