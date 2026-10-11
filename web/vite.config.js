import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
            manifest: {
                name: "Todo",
                short_name: "Todo",
                description: "A personal daily todo list",
                theme_color: "#0f172a",
                background_color: "#0f172a",
                display: "standalone",
                start_url: "/",
                // Generated from public/favicon.svg with @vite-pwa/assets-generator.
                icons: [
                    { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
                    { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
                    {
                        src: "maskable-icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable"
                    }
                ]
            },
            workbox: {
                // Serve the last-fetched todo list when the API can't be reached,
                // so the list is still readable offline.
                runtimeCaching: [
                    {
                        // This function is copied as source text into the generated
                        // service worker, so it can't use variables from this file.
                        urlPattern: ({ url }) => url.pathname.startsWith("/lists/"),
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "api-cache",
                            networkTimeoutSeconds: 5
                        }
                    }
                ]
            }
        })
    ]
});
