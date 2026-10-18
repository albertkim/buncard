import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { globPatterns: ["**/*.{js,css,html,png,svg,woff2}"], navigateFallback: "/index.html" },
      includeAssets: ["favicon.png", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Buncard",
        short_name: "Buncard",
        description: "Store your loyalty cards, membership cards, and other barcodes all in one place",
        theme_color: "#fff9ed",
        background_color: "#fff9ed",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
})
